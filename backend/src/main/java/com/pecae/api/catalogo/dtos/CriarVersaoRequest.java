package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import com.pecae.api.catalogo.entities.enums.TipoTransmissao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CriarVersaoRequest(
        @NotBlank(message = "O nome da versão é obrigatório")
        @JsonProperty("name")
        String nome,

        @NotNull(message = "O ID do modelo é obrigatório")
        @JsonProperty("modelId")
        UUID modeloId,

        @NotNull(message = "O tipo de combustível é obrigatório")
        @JsonProperty("fuelType")
        TipoCombustivel tipoCombustivel,

        @NotNull(message = "O tipo de transmissão é obrigatório")
        @JsonProperty("transmissionType")
        TipoTransmissao tipoTransmissao,

        @JsonProperty("engineDisplacementCc")
        Integer cilindradaCc
) {
}
