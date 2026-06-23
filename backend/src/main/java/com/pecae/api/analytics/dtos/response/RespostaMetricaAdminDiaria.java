package com.pecae.api.analytics.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RespostaMetricaAdminDiaria(
    LocalDate data,
    Integer dau,
    Integer totalAnuncios,
    BigDecimal receitaTotal
) {}
