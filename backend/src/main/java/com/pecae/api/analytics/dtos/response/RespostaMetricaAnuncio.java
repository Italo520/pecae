package com.pecae.api.analytics.dtos.response;

import java.util.UUID;

public record RespostaMetricaAnuncio(
    UUID anuncioId,
    String titulo,
    Integer visualizacoes,
    Integer contatos,
    Double taxaConversao
) {}
