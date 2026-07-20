package com.pecae.api.favorito.dtos.response;

import com.pecae.api.anuncio.dtos.RespostaAnuncio;
import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaFavorito(
    UUID id,
    RespostaAnuncio anuncio,
    LocalDateTime criadoEm
) {}
