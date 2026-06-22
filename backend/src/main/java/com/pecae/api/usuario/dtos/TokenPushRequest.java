package com.pecae.api.usuario.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.usuario.entities.enums.PlataformaPush;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para requisição de registro ou atualização de push token do Expo.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenPushRequest {

    @NotBlank(message = "O token é obrigatório")
    private String token;

    @NotNull(message = "A plataforma é obrigatória")
    @JsonProperty("platform")
    private PlataformaPush plataforma;
}
