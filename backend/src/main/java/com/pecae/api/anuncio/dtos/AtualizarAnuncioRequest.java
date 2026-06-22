package com.pecae.api.anuncio.dtos;

import jakarta.validation.constraints.Size;

public record AtualizarAnuncioRequest(
    @Size(min = 10, max = 255, message = "O título deve ter entre 10 e 255 caracteres")
    String titulo,

    @Size(max = 5000, message = "A descrição não pode exceder 5000 caracteres")
    String descricao
) {}
