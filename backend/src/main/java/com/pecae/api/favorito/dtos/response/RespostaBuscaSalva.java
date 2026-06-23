package com.pecae.api.favorito.dtos.response;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record RespostaBuscaSalva(
    UUID id,
    String nome,
    Map<String, Object> filtros,
    Boolean ativa,
    LocalDateTime criadaEm
) {}
