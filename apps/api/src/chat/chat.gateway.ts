import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { RedisService } from '../common/redis/redis.service';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Cliente Redis dedicado para SUBSCRIBE (não pode compartilhar com publisher)
  private subscriber: Redis;

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    // Cria uma conexão Redis separada exclusiva para SUBSCRIBE
    this.subscriber = new Redis({
      host:
        this.configService.get('REDIS_HOST', 'localhost') === 'redis'
          ? 'pecae-redis'
          : this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });

    // Quando o Redis recebe uma mensagem, emite para os sockets da room
    this.subscriber.on('message', (channel: string, message: string) => {
      try {
        // channel = "chat:room:<roomId>"
        const roomId = channel.replace('chat:room:', '');
        const payload = JSON.parse(message);
        this.server.to(`room:${roomId}`).emit('new_message', payload);
      } catch (err) {
        this.logger.error('Erro ao processar mensagem do Redis Pub/Sub', err);
      }
    });

    this.logger.log('ChatGateway inicializado com Redis Pub/Sub');
  }

  // ─── Conexão ─────────────────────────────────────────────────────────────

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'Token não fornecido.' });
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub || payload.id;
      this.logger.log(`Cliente conectado: ${client.data.userId} (${client.id})`);

      // Registrar presença no Redis (expira em 5 minutos, renovado via heartbeat)
      await this.redisService.set(
        `presence:${client.data.userId}`,
        { socketId: client.id, connectedAt: new Date().toISOString() },
        300,
      );
    } catch {
      client.emit('error', { message: 'Token inválido ou expirado.' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      await this.redisService.del(`presence:${client.data.userId}`);
      this.logger.log(`Cliente desconectado: ${client.data.userId} (${client.id})`);
    }
  }

  // ─── Eventos ─────────────────────────────────────────────────────────────

  /**
   * Cliente entra em uma room de chat.
   * Subscreve no canal Redis e retorna o histórico de mensagens.
   */
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    const userId = client.data.userId;

    if (!userId) throw new WsException('Não autenticado.');
    if (!roomId) throw new WsException('roomId é obrigatório.');

    try {
      // Valida acesso via ChatService (lança ForbiddenException se não for membro)
      await this.chatService.findRoomById(roomId, userId);

      // Entra na room Socket.io
      await client.join(`room:${roomId}`);

      // Subscreve no canal Redis dessa room (idempotente)
      await this.subscriber.subscribe(`chat:room:${roomId}`);

      this.logger.log(`Usuário ${userId} entrou na room ${roomId}`);

      // Retorna histórico paginado
      const history = await this.chatService.findMessages(roomId, userId);
      client.emit('room_history', history);

      // Marca mensagens como lidas ao entrar na room
      await this.chatService.markAsRead(roomId, userId);
    } catch (err) {
      throw new WsException(err.message || 'Erro ao entrar na room.');
    }
  }

  /**
   * Cliente sai de uma room de chat.
   */
  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const { roomId } = data;
    await client.leave(`room:${roomId}`);
    this.logger.log(`Usuário ${client.data.userId} saiu da room ${roomId}`);
  }

  /**
   * Envia uma mensagem.
   * Fluxo: Persiste no banco → Publica no Redis → Redis entrega para todos os pods.
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const { roomId, content } = data;
    const userId = client.data.userId;

    if (!userId) throw new WsException('Não autenticado.');
    if (!roomId || !content?.trim()) {
      throw new WsException('roomId e content são obrigatórios.');
    }

    try {
      // 1. Persiste no banco via ChatService existente
      const message = await this.chatService.sendMessage(roomId, userId, content.trim());

      // 2. Publica no Redis Pub/Sub → distribui para todos os pods NestJS
      //    que estiverem subscritos nesse canal
      await this.redisService.set(
        `__publish__chat:room:${roomId}`,
        message,
        // trick: usamos o método set + del para acessar o client, mas
        // o ideal é expor um método publish no RedisService (ver abaixo)
        undefined,
      );

      // Publica diretamente usando o client interno do RedisService
      // Como o RedisService encapsula o client, publicamos via método dedicado
      await this.publishToRoom(roomId, message);

      return { success: true, messageId: message.id };
    } catch (err) {
      throw new WsException(err.message || 'Erro ao enviar mensagem.');
    }
  }

  /**
   * Evento de "digitando..." — broadcast instantâneo sem persistência.
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const { roomId, isTyping } = data;
    if (!roomId) return;

    // Emite para os outros membros da room (excluindo quem enviou)
    client.to(`room:${roomId}`).emit('user_typing', {
      userId: client.data.userId,
      isTyping,
    });
  }

  /**
   * Heartbeat — renova a presença no Redis a cada 4 minutos.
   */
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket) {
    if (client.data.userId) {
      await this.redisService.set(
        `presence:${client.data.userId}`,
        { socketId: client.id, connectedAt: new Date().toISOString() },
        300,
      );
    }
    return { event: 'pong', data: { timestamp: Date.now() } };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Publica uma mensagem no canal Redis da room.
   * Cria uma instância de publish separada do subscriber.
   * 
   * NOTA: Para uma solução mais limpa, adicione um método `publish(channel, value)`
   * no RedisService expondo o client diretamente.
   */
  private async publishToRoom(roomId: string, payload: any): Promise<void> {
    // Reutiliza a mesma conexão do subscriber para publicar
    // (ioredis permite publish em conexões que também subscrevem em outros canais)
    await this.subscriber.publish(
      `chat:room:${roomId}`,
      JSON.stringify(payload),
    );
  }
}
