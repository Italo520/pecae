package com.pecae.api.chat.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequisicaoEnviarMensagem(
    @NotBlank(message = "O conteúdo da mensagem não pode ser vazio.")
    @Size(min = 1, max = 2000, message = "A mensagem deve ter entre 1 e 2000 caracteres.")
    String conteudo
) {}
