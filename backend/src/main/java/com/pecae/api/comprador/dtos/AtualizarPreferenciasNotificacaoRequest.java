package com.pecae.api.comprador.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarPreferenciasNotificacaoRequest {

    @JsonProperty("push")
    private Boolean push;

    @JsonProperty("email")
    private Boolean email;

    @JsonProperty("inApp")
    private Boolean noApp;
}
