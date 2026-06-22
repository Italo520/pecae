package com.pecae.api.autenticacao.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO para requisição de verificação de e-mail por código de uso único.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificarEmailRequest {

    @NotBlank(message = "O código de verificação é obrigatório")
    @Size(min = 6, max = 6, message = "O código de verificação deve conter exatamente 6 caracteres")
    @JsonProperty("code")
    private String codigo;
}
