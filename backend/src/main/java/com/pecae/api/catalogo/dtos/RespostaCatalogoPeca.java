package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record RespostaCatalogoPeca(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("partName")
        String nomePeca,

        @JsonProperty("partCode")
        String codigoPeca,

        @JsonProperty("category")
        RespostaCategoriaPeca categoria,

        @JsonProperty("versionId")
        UUID versaoId,

        @JsonProperty("active")
        Boolean ativo
) {
}
