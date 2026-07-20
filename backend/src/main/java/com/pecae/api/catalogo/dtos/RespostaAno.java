package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record RespostaAno(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("year")
        Integer ano,

        @JsonProperty("fipeCode")
        String codigoFipe,

        @JsonProperty("versionId")
        UUID versaoId
) {
}
