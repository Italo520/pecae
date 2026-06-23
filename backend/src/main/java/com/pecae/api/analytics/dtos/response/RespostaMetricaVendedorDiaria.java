package com.pecae.api.analytics.dtos.response;

import java.time.LocalDate;

public record RespostaMetricaVendedorDiaria(
    LocalDate data,
    Integer visualizacoes,
    Integer contatos,
    Double taxaConversao
) {}
