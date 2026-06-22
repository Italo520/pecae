package com.pecae.api.chat.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaSalaChat(
    UUID id,
    UUID anuncioId,
    UUID veiculoId,
    String tituloDaConversa,
    String miniaturaDaConversa,
    UUID vendedorId,
    RespostaInterlocutor interlocutor,
    RespostaUltimaMensagem ultimaMensagem,
    long naoLidos,
    LocalDateTime atualizadaEm
) {}
