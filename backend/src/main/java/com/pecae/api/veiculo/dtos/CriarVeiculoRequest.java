package com.pecae.api.veiculo.dtos;

import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.UUID;

public record CriarVeiculoRequest(
    @NotBlank(message = "O nome da marca é obrigatório")
    String marcaNome,

    @NotBlank(message = "O nome do modelo é obrigatório")
    String modeloNome,

    @NotBlank(message = "O ano é obrigatório")
    String anoNome,

    String versaoNome,

    @NotBlank(message = "A cor é obrigatória")
    @Size(max = 50, message = "A cor não pode ter mais de 50 caracteres")
    String cor,

    @NotBlank(message = "A cidade é obrigatória")
    @Size(max = 100, message = "A cidade não pode ter mais de 100 caracteres")
    String cidade,

    @NotBlank(message = "O estado é obrigatório")
    @Size(min = 2, max = 2, message = "O estado deve ter exatamente 2 caracteres")
    String estado,

    Double latitude,
    Double longitude,
    String observacoes,

    TipoCombustivel tipoCombustivel,

    @Min(value = 0, message = "A quilometragem não pode ser negativa")
    Integer quilometragem,

    List<String> pecasDisponiveis
) {}
