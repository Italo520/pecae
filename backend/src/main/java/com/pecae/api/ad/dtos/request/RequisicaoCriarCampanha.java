package com.pecae.api.ad.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO que encapsula os dados para criação de uma nova campanha de publicidade.
 */
public record RequisicaoCriarCampanha(
    @NotBlank(message = "O nome da campanha é obrigatório")
    String nome,

    @NotNull(message = "O ID do anunciante é obrigatório")
    UUID anuncianteId,

    @NotNull(message = "A data de início é obrigatória")
    LocalDate dataInicio,

    @NotNull(message = "A data de fim é obrigatória")
    LocalDate dataFim,

    BigDecimal orcamentoTotal,

    String notasInternas
) {}
