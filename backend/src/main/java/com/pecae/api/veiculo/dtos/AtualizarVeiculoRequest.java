package com.pecae.api.veiculo.dtos;

import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record AtualizarVeiculoRequest(
    @Size(max = 20, message = "A placa não pode ter mais de 20 caracteres")
    String placa,

    @Size(max = 50, message = "A cor não pode ter mais de 50 caracteres")
    String cor,

    @Size(max = 100, message = "A cidade não pode ter mais de 100 caracteres")
    String cidade,

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
