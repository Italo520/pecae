package com.pecae.api.autenticacao.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO para redefinição de senha com base em um token de recuperação.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedefinirSenhaRequest {

    @NotBlank(message = "O token de recuperação é obrigatório")
    private String token;

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 8, message = "A nova senha deve ter pelo menos 8 caracteres")
    @JsonProperty("newPassword")
    private String novaSenha;
}
