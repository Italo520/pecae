package com.pecae.api.vendedor.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record RespostaEstatisticasVendedor(
        @JsonProperty("id")
        UUID id,

        @JsonProperty("totalListings")
        Integer totalAnuncios,

        @JsonProperty("activeListings")
        Integer anunciosAtivos,

        @JsonProperty("ratingAvg")
        Double mediaAvaliacao,

        @JsonProperty("totalReviews")
        Integer totalAvaliacoes
) {
}
