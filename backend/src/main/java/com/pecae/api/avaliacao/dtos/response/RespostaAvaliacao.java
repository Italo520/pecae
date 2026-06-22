package com.pecae.api.avaliacao.dtos.response;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaAvaliacao(
    @JsonProperty("id")
    UUID id,

    @JsonProperty("sellerId")
    UUID vendedorId,

    @JsonProperty("reviewerId")
    UUID avaliadorId,

    @JsonProperty("reviewerName")
    String nomeAvaliador,

    @JsonProperty("rating")
    Integer nota,

    @JsonProperty("comment")
    String comentario,

    @JsonProperty("createdAt")
    LocalDateTime criadaEm,

    @JsonProperty("updatedAt")
    LocalDateTime atualizadaEm
) {}
