package com.pecae.api.chat.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaMensagemChat(
    UUID id,
    UUID salaId,
    UUID remetenteId,
    String conteudo,
    LocalDateTime criadaEm
) {}
