package com.pecae.api.analytics.dtos.response;

import java.util.List;

public record RespostaAnalyticsVendedor(
    Integer totalVisualizacoes,
    Integer totalContatos,
    Double taxaConversao,
    List<RespostaMetricaVendedorDiaria> historico
) {}
