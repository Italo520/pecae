package com.pecae.api.chat.dtos;

import java.util.List;

public record RespostaCursorMensagens(
    List<RespostaMensagemChat> itens,
    String proximoCursor
) {}
