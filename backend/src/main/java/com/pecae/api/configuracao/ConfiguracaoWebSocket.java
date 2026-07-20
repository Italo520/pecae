package com.pecae.api.configuracao;

import com.pecae.api.compartilhado.seguranca.InterceptadorAutenticacaoStomp;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuração de WebSocket com STOMP para o chat em tempo real.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class ConfiguracaoWebSocket implements WebSocketMessageBrokerConfigurer {

    private final InterceptadorAutenticacaoStomp interceptadorAutenticacaoStomp;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefixo para mensagens de broadcast do servidor → client
        config.enableSimpleBroker("/topic", "/queue");

        // Prefixo para mensagens do client → servidor
        config.setApplicationDestinationPrefixes("/app");

        // Prefixo para mensagens privadas (user-specific)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint de conexão WebSocket com SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(interceptadorAutenticacaoStomp);
    }
}
