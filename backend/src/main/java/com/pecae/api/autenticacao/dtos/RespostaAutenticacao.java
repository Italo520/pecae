package com.pecae.api.autenticacao.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import lombok.*;

/**
 * Resposta de autenticação contendo tokens JWT e dados públicos do usuário logado.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespostaAutenticacao {
    private TokensResponse tokens;

    @JsonProperty("user")
    private UsuarioResponse usuario;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokensResponse {
        private String accessToken;
        private String refreshToken;
    }
}
