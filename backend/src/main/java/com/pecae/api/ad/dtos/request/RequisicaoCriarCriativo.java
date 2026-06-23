package com.pecae.api.ad.dtos.request;

import com.pecae.api.ad.entities.enums.PlacementAd;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * DTO que encapsula os dados para criação de um novo criativo (banner).
 */
public record RequisicaoCriarCriativo(
    @NotNull(message = "O ID da campanha é obrigatório")
    UUID campanhaId,

    @NotBlank(message = "O título alternativo é obrigatório")
    String tituloAlt,

    @NotBlank(message = "A URL da imagem é obrigatória")
    String urlImagem,

    @NotBlank(message = "A URL de destino é obrigatória")
    String urlDestino,

    String textoCta,

    @NotNull(message = "O posicionamento (placement) é obrigatório")
    PlacementAd placement,

    int prioridade
) {}
