package com.pecae.api.veiculo.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RespostaDetalheVeiculo(
    UUID id,
    UUID perfilVendedorId,
    String marcaNome,
    String modeloNome,
    String versaoNome,
    Integer ano,
    String placa,
    String cor,
    String cidade,
    String estado,
    Double latitude,
    Double longitude,
    String observacoes,
    String status,
    String tipoCombustivel,
    Integer quilometragem,
    List<String> pecasDisponiveis,
    List<RespostaFotoVeiculo> fotos,
    LocalDateTime criadoEm,
    LocalDateTime atualizadoEm
) {}
