package com.pecae.api.ad.dtos.response;

import java.util.UUID;

/**
 * DTO que consolida as métricas básicas de um criativo.
 */
public record RespostaMetricaAd(
    UUID criativoId,
    String tituloAlt,
    long totalImpressoes,
    long totalCliques,
    double ctr
) {}
