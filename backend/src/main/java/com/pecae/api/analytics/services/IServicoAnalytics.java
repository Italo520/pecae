package com.pecae.api.analytics.services;

import com.pecae.api.analytics.dtos.response.RespostaAnalyticsAdmin;
import com.pecae.api.analytics.dtos.response.RespostaAnalyticsVendedor;

import java.time.LocalDate;
import java.util.UUID;

public interface IServicoAnalytics {
    RespostaAnalyticsVendedor obterMetricasVendedor(UUID vendedorId, LocalDate inicio, LocalDate fim);
    RespostaAnalyticsAdmin obterMetricasGlobais(LocalDate inicio, LocalDate fim);
    void realizarAgregacaoDiaria();
}
