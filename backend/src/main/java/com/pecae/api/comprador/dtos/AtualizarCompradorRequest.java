package com.pecae.api.comprador.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarCompradorRequest {

    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    @JsonProperty("name")
    private String nome;

    @JsonProperty("avatar")
    private String avatar;

    @Valid
    @JsonProperty("notificationPreferences")
    private AtualizarPreferenciasNotificacaoRequest preferenciasNotificacao;
}
