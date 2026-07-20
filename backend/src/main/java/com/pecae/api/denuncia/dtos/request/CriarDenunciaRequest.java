package com.pecae.api.denuncia.dtos.request;

import com.pecae.api.denuncia.entities.enums.CategoriaDenuncia;
import com.pecae.api.denuncia.entities.enums.TipoAlvoDenuncia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CriarDenunciaRequest(
    @NotNull(message = "O tipo de alvo é obrigatório.")
    TipoAlvoDenuncia tipoAlvo,

    @NotNull(message = "O ID do alvo é obrigatório.")
    UUID idAlvo,

    @NotNull(message = "A categoria da denúncia é obrigatória.")
    CategoriaDenuncia categoria,

    @Size(max = 1000, message = "A descrição não pode exceder 1000 caracteres.")
    String descricao
) {}
