package com.pecae.api.ad.dtos.response;

import com.pecae.api.ad.entities.enums.PlacementAd;

import java.util.UUID;

/**
 * DTO que o frontend recebe ao solicitar um banner para exibição.
 */
public record RespostaAdServido(
    UUID criativoId,
    String tituloAlt,
    String urlImagem,
    String urlDestino,
    String textoCta,
    PlacementAd placement
) {}
