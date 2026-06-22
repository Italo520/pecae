package com.pecae.api.comprador.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespostaCompradorMe {

    @JsonProperty("id")
    private UUID id;

    @JsonProperty("email")
    private String email;

    @JsonProperty("name")
    private String nome;

    @JsonProperty("emailVerified")
    private boolean emailVerificado;

    @JsonProperty("phoneVerified")
    private boolean telefoneVerificado;

    @JsonProperty("avatar")
    private String avatar;

    @JsonProperty("buyerProfile")
    private RespostaPerfilComprador perfilComprador;

    @JsonProperty("notificationPreferences")
    private RespostaPreferenciasNotificacao preferenciasNotificacao;
}
