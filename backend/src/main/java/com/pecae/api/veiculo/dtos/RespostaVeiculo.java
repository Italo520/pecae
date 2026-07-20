package com.pecae.api.veiculo.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaVeiculo(
    UUID id,
    String marcaNome,
    String modeloNome,
    Integer ano,
    String placa,
    String cor,
    String cidade,
    String estado,
    String status,
    String urlFotoPrincipal,
    LocalDateTime criadoEm
) {}
