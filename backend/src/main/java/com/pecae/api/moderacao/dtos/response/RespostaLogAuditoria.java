package com.pecae.api.moderacao.dtos.response;

import com.pecae.api.moderacao.entities.enums.AcaoModeracao;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaLogAuditoria(
    UUID id,
    UUID moderadorId,
    String nomeModerador,
    AcaoModeracao acao,
    String tipoEntidade,
    UUID idEntidade,
    String motivo,
    LocalDateTime criadoEm
) {}
