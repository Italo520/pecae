package com.pecae.api.vendedor.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.vendedor.entities.enums.TipoVendedor;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaPerfilVendedor(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("userId")
        UUID usuarioId,

        @JsonProperty("name")
        String nome,

        @JsonProperty("document")
        String documento,

        @JsonProperty("phone")
        String telefone,

        @JsonProperty("bio")
        String biografia,

        @JsonProperty("logoUrl")
        String urlLogo,

        @JsonProperty("bannerUrl")
        String urlBanner,

        @JsonProperty("sellerType")
        TipoVendedor tipoVendedor,

        @JsonProperty("createdAt")
        LocalDateTime criadoEm,

        @JsonProperty("updatedAt")
        LocalDateTime atualizadoEm,

        @JsonProperty("stats")
        RespostaEstatisticasVendedor estatisticas,

        @JsonProperty("verification")
        RespostaVerificacaoVendedor verificacao
) {
}
