package com.pecae.api.vendedor.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.vendedor.entities.enums.StatusVerificacao;
import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaVerificacaoVendedor(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("status")
        StatusVerificacao status,

        @JsonProperty("requestedAt")
        LocalDateTime solicitadoEm,

        @JsonProperty("resolvedAt")
        LocalDateTime resolvidoEm,

        @JsonProperty("rejectionReason")
        String motivoRejeicao
) {
}
