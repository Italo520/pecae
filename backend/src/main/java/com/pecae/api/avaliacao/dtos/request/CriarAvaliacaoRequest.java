package com.pecae.api.avaliacao.dtos.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CriarAvaliacaoRequest(
    @NotNull(message = "O ID do vendedor é obrigatório.")
    @JsonProperty("sellerId")
    UUID vendedorId,

    @NotNull(message = "A nota é obrigatória.")
    @Min(value = 1, message = "A nota mínima é 1.")
    @Max(value = 5, message = "A nota máxima é 5.")
    @JsonProperty("rating")
    Integer nota,

    @Size(max = 1000, message = "O comentário não pode exceder 1000 caracteres.")
    @JsonProperty("comment")
    String comentario
) {}
