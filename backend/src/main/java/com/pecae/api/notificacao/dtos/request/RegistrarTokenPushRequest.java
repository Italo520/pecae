package com.pecae.api.notificacao.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * DTO para solicitação de registro de um token de push notification.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrarTokenPushRequest {

    @NotBlank(message = "O token do dispositivo não pode estar em branco")
    private String token;

    private String infoDispositivo;
}
