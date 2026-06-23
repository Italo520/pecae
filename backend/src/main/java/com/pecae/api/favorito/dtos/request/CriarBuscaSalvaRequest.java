package com.pecae.api.favorito.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Map;

public record CriarBuscaSalvaRequest(
    @NotBlank(message = "O nome da busca salva é obrigatório.")
    @Size(max = 255, message = "O nome não pode exceder 255 caracteres.")
    String nome,

    @NotNull(message = "Os filtros da busca são obrigatórios.")
    Map<String, Object> filtros
) {}
