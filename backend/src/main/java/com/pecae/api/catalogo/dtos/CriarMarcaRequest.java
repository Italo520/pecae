package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CriarMarcaRequest(
        @NotBlank(message = "O nome da marca é obrigatório")
        @JsonProperty("name")
        String nome,

        @JsonProperty("logoUrl")
        String urlLogo
) {
}
