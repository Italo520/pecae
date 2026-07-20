package com.pecae.api.vendedor.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.vendedor.entities.enums.TipoVendedor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CriarVendedorRequest(
        @NotBlank(message = "O nome é obrigatório")
        @JsonProperty("name")
        String nome,

        @NotBlank(message = "O documento é obrigatório")
        @JsonProperty("document")
        String documento,

        @NotBlank(message = "O telefone é obrigatório")
        @JsonProperty("phone")
        String telefone,

        @NotNull(message = "O tipo de vendedor é obrigatório")
        @JsonProperty("sellerType")
        TipoVendedor tipoVendedor
) {
}
