package com.pecae.api.chat.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaUltimaMensagem(
    String conteudo,
    UUID remetenteId,
    LocalDateTime criadaEm
) {}
