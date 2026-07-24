package com.pecae.api.vendedor.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AtualizarVendedorRequest(
        @JsonProperty("name")
        String nome,

        @JsonProperty("phone")
        String telefone,

        @JsonProperty("bio")
        String biografia,

        @JsonProperty("address")
        String endereco,

        @JsonProperty("city")
        String cidade,

        @JsonProperty("state")
        String estado,

        @JsonProperty("whatsapp")
        String whatsapp
) {
}
