package com.pecae.api.denuncia.dtos.response;

import com.pecae.api.denuncia.entities.enums.CategoriaDenuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.entities.enums.TipoAlvoDenuncia;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaDenuncia(
    UUID id,
    UUID reporterId,
    String nomeReporter,
    TipoAlvoDenuncia tipoAlvo,
    UUID idAlvo,
    CategoriaDenuncia categoria,
    String descricao,
    StatusDenuncia status,
    LocalDateTime criadaEm,
    LocalDateTime atualizadaEm
) {}
