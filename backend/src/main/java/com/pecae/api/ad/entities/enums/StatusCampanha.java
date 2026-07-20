package com.pecae.api.ad.entities.enums;

/**
 * Enum que representa o status de uma campanha publicitária no sistema.
 */
public enum StatusCampanha {
    RASCUNHO,   // Admin criou mas ainda não ativou
    ATIVA,      // Em exibição
    PAUSADA,    // Temporariamente suspensa
    ENCERRADA   // Campanha concluída ou cancelada
}
