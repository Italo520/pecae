package com.pecae.api.ad.dtos.response;

import com.pecae.api.ad.entities.enums.PlacementAd;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de resposta com detalhes do criativo (banner).
 */
public record RespostaCriativoAd(
    UUID id,
    UUID campanhaId,
    String tituloAlt,
    String urlImagem,
    String urlDestino,
    String textoCta,
    PlacementAd placement,
    int prioridade,
    boolean ativo,
    LocalDateTime criadoEm
) {}
