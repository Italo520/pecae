package com.pecae.api.moderacao.dtos.request;

import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DecisaoModeracaoRequest(
    @NotNull(message = "A ação de moderação é obrigatória.")
    AcaoModeracao acao,

    @NotBlank(message = "O motivo da decisão é obrigatório.")
    @Size(max = 1000, message = "O motivo não pode exceder 1000 caracteres.")
    String motivo
) {}
