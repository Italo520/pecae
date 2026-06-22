package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record RespostaCategoriaPeca(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("name")
        String nome,

        @JsonProperty("iconUrl")
        String urlIcone,

        @JsonProperty("parentId")
        UUID paiId
) {
}
