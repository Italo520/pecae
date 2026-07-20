package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.catalogo.entities.enums.SegmentoVeiculo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CriarModeloRequest(
        @NotBlank(message = "O nome do modelo é obrigatório")
        @JsonProperty("name")
        String nome,

        @NotNull(message = "O ID da marca é obrigatório")
        @JsonProperty("brandId")
        UUID marcaId,

        @NotNull(message = "O segmento é obrigatório")
        @JsonProperty("segment")
        SegmentoVeiculo segmento
) {
}
