package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record RespostaCascataCatalogo(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("name")
        String nome
) {
}
