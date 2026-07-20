package com.pecae.api.catalogo.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CriarCategoriaPecaRequest(
        @NotBlank(message = "O nome da categoria é obrigatório")
        @JsonProperty("name")
        String nome,

        @JsonProperty("slug")
        String slug,

        @JsonProperty("icon")
        String urlIcone
) {
}
