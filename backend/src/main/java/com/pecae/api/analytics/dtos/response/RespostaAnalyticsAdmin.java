package com.pecae.api.analytics.dtos.response;

import java.math.BigDecimal;
import java.util.List;

public record RespostaAnalyticsAdmin(
    Integer totalAnunciosAtivos,
    Integer totalUsuariosAtivos,
    BigDecimal receitaTotalAcumulada,
    List<RespostaMetricaAdminDiaria> historico
) {}
