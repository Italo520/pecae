package com.pecae.api.chat.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.chat.dtos.RequisicaoEnviarMensagem;
import com.pecae.api.chat.dtos.RespostaCursorMensagens;
import com.pecae.api.chat.dtos.RespostaMensagemChat;
import com.pecae.api.chat.services.IServicoChat;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ControladorWebSocketChat {

    private final IServicoChat servicoChat;
    private final StringRedisTemplate redisTemplate;
    private final SimpMessagingTemplate brokerStomp;
    private final ObjectMapper objectMapper;

    private static final int TTL_PRESENCA_SEGUNDOS = 300; // 5 minutos

    /**
     * Entra na sala de chat.
     * Retorna histórico inicial e marca mensagens como lidas.
     * Canal STOMP: /app/chat.join/{salaId}
     */
    @MessageMapping("/chat.join/{salaId}")
    public void entrarNaSala(
        @DestinationVariable String salaId,
        Principal principal
    ) {
        UUID usuarioId = obterUsuarioId(principal);
        UUID salaUUID = UUID.fromString(salaId);

        // 1. Valida acesso à sala (lança exceção se não for participante)
        servicoChat.buscarSalaPorId(salaUUID, usuarioId);

        // 2. Busca histórico inicial (página 1 sem cursor)
        RespostaCursorMensagens historico = servicoChat.buscarMensagens(salaUUID, usuarioId, null);

        // 3. Envia histórico apenas para o usuário que entrou (canal privado)
        brokerStomp.convertAndSendToUser(
            principal.getName(), "/queue/historico", historico
        );

        // 4. Marca mensagens como lidas ao entrar
        servicoChat.marcarComoLido(salaUUID, usuarioId);

        // 5. Registra presença no Redis
        registrarPresenca(usuarioId.toString());

        log.info("Usuário {} entrou na sala {}", usuarioId, salaId);
    }

    /**
     * Envia uma mensagem via WebSocket.
     * Persiste no banco → publica no Redis → Redis entrega via STOMP a todos.
     * Canal STOMP: /app/chat.send/{salaId}
     */
    @MessageMapping("/chat.send/{salaId}")
    public void enviarMensagem(
        @DestinationVariable String salaId,
        @Payload RequisicaoEnviarMensagem requisicao,
        Principal principal
    ) {
        UUID usuarioId = obterUsuarioId(principal);
        UUID salaUUID = UUID.fromString(salaId);

        // 1. Persiste a mensagem no banco
        RespostaMensagemChat mensagem = servicoChat.enviarMensagem(
            salaUUID, usuarioId, requisicao.conteudo()
        );

        // 2. Publica no Redis Pub/Sub → ListenerMensagemChatRedis faz o broadcast STOMP
        publicarNoRedis(salaId, mensagem);
    }

    /**
     * Evento "digitando..." — broadcast instantâneo, sem persistência.
     * Canal STOMP: /app/chat.typing/{salaId}
     */
    @MessageMapping("/chat.typing/{salaId}")
    public void indicarDigitacao(
        @DestinationVariable String salaId,
        @Payload Map<String, Object> payload,
        Principal principal
    ) {
        UUID usuarioId = obterUsuarioId(principal);
        boolean digitando = Boolean.TRUE.equals(payload.get("digitando"));

        brokerStomp.convertAndSend("/topic/room/" + salaId + "/typing",
            Map.of("usuarioId", usuarioId.toString(), "digitando", digitando)
        );
    }

    /**
     * Heartbeat — renova presença no Redis.
     * Canal STOMP: /app/chat.ping
     */
    @MessageMapping("/chat.ping")
    public void heartbeat(Principal principal) {
        UUID usuarioId = obterUsuarioId(principal);
        registrarPresenca(usuarioId.toString());
        brokerStomp.convertAndSendToUser(
            principal.getName(), "/queue/pong",
            Map.of("timestamp", Instant.now().toEpochMilli())
        );
    }

    // ── Helpers privados ────────────────────────────────────────────────────

    private UUID obterUsuarioId(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof PrincipalUsuario principalUsuario) {
                return principalUsuario.getId();
            }
        }
        throw new IllegalArgumentException("Principal inválido ou não autenticado.");
    }

    private void publicarNoRedis(String salaId, RespostaMensagemChat mensagem) {
        try {
            String payload = objectMapper.writeValueAsString(mensagem);
            redisTemplate.convertAndSend("chat:room:" + salaId, payload);
        } catch (JsonProcessingException e) {
            log.error("Erro ao serializar mensagem para publicação no Redis", e);
        }
    }

    private void registrarPresenca(String usuarioId) {
        redisTemplate.opsForValue().set(
            "presence:" + usuarioId,
            Instant.now().toString(),
            Duration.ofSeconds(TTL_PRESENCA_SEGUNDOS)
        );
    }
}
