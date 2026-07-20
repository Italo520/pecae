package com.pecae.api.chat.dtos;

import java.util.UUID;

public record RespostaInterlocutor(
    UUID id,
    String nome,
    String avatar
) {}
