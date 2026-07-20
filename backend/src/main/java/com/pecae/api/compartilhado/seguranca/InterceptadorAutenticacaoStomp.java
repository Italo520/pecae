package com.pecae.api.compartilhado.seguranca;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterceptadorAutenticacaoStomp implements ChannelInterceptor {

    private final ProvedorTokenJwt provedorTokenJwt;
    private final ServicoDetalhesUsuarioCustomizado servicoDetalhesUsuarioCustomizado;

    @Override
    public Message<?> preSend(Message<?> mensagem, MessageChannel canal) {
        StompHeaderAccessor acesso = MessageHeaderAccessor.getAccessor(mensagem, StompHeaderAccessor.class);

        if (acesso != null && StompCommand.CONNECT.equals(acesso.getCommand())) {
            String token = obterTokenStomp(acesso);

            if (!StringUtils.hasText(token)) {
                log.error("Tentativa de conexão WebSocket sem token JWT.");
                throw new MessageDeliveryException("Token não fornecido no frame CONNECT.");
            }

            try {
                if (provedorTokenJwt.validarToken(token)) {
                    String email = provedorTokenJwt.obterEmailDoToken(token);
                    UserDetails userDetails = servicoDetalhesUsuarioCustomizado.loadUserByUsername(email);
                    
                    UsernamePasswordAuthenticationToken autenticacao = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    
                    acesso.setUser(autenticacao);
                    log.info("Conexão WebSocket autenticada com sucesso para: {}", email);
                } else {
                    log.error("Token JWT inválido na conexão WebSocket.");
                    throw new MessageDeliveryException("Token JWT inválido ou expirado.");
                }
            } catch (Exception e) {
                log.error("Erro ao autenticar usuário no WebSocket", e);
                throw new MessageDeliveryException("Falha na autenticação: " + e.getMessage());
            }
        }

        return mensagem;
    }

    private String obterTokenStomp(StompHeaderAccessor acesso) {
        String authHeader = acesso.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
