package com.pecae.api.chat.services.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.chat.dtos.RespostaMensagemChat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ListenerMensagemChatRedis implements MessageListener {

    private final SimpMessagingTemplate brokerStomp;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message mensagem, byte[] padrao) {
        try {
            String canal = new String(mensagem.getChannel());
            String salaId = canal.replace("chat:room:", "");
            String corpo = new String(mensagem.getBody());
            
            // Remove as aspas do início e do fim caso a String venha serializada pelo RedisTemplate de String
            if (corpo.startsWith("\"") && corpo.endsWith("\"")) {
                corpo = corpo.substring(1, corpo.length() - 1);
                corpo = corpo.replace("\\\"", "\"");
            }
            
            RespostaMensagemChat payload = objectMapper.readValue(corpo, RespostaMensagemChat.class);

            // Broadcast para todos os assinantes STOMP da sala
            brokerStomp.convertAndSend("/topic/room/" + salaId, payload);
            log.debug("Mensagem entregue via STOMP para a sala {}: {}", salaId, payload.id());
        } catch (Exception e) {
            log.error("Erro ao processar mensagem do Redis Pub/Sub para STOMP", e);
        }
    }
}
