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
    private String accessToken;
    private String refreshToken;

    @JsonProperty("user")
    private UsuarioResponse usuario;
}
