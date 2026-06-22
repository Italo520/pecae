package com.pecae.api.autenticacao.dtos;

import lombok.*;

/**
 * Resposta simples com o novo par de tokens após renovação de sessão (refresh).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespostaToken {
    private String accessToken;
    private String refreshToken;
}
