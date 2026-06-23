package com.pecae.api.ad.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO de resposta contendo os detalhes do Anunciante.
 */
public record RespostaAnunciante(
    UUID id,
    String nomeEmpresa,
    String nomeContato,
    String emailContato,
    String telefoneContato,
    boolean ativo,
    LocalDateTime criadoEm
) {}
