package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import com.pecae.api.catalogo.entities.enums.TipoTransmissao;
import java.util.UUID;

public record RespostaVersao(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("name")
        String nome,

        @JsonProperty("fuelType")
        TipoCombustivel tipoCombustivel,

        @JsonProperty("transmissionType")
        TipoTransmissao tipoTransmissao,

        @JsonProperty("engineDisplacementCc")
        Integer cilindradaCc,

        @JsonProperty("modelId")
        UUID modeloId
) {
}
