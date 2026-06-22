package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.catalogo.entities.enums.SegmentoVeiculo;
import java.util.UUID;

public record RespostaModelo(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("name")
        String nome,

        @JsonProperty("segment")
        SegmentoVeiculo segmento,

        @JsonProperty("brandId")
        UUID marcaId
) {
}
