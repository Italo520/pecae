package com.pecae.api.ad.dtos.response;

import com.pecae.api.ad.entities.enums.StatusCampanha;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de resposta contendo os detalhes de uma campanha.
 */
public record RespostaCampanhaAd(
    UUID id,
    String nome,
    RespostaAnunciante anunciante,
    StatusCampanha status,
    LocalDate dataInicio,
    LocalDate dataFim,
    BigDecimal orcamentoTotal,
    String notasInternas,
    LocalDateTime criadoEm
) {}
