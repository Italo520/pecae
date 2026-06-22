package com.pecae.api.anuncio.dtos;

import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RespostaDetalheAnuncio(
    UUID id,
    String titulo,
    String descricao,
    String status,
    Integer visualizacoes,
    Integer totalFavoritos,

    // Veículo completo
    UUID veiculoId,
    String marcaNome,
    String modeloNome,
    String versaoNome,
    Integer anoFabricacao,
    String cor,
    String observacoes,
    Integer quilometragem,
    List<RespostaFotoVeiculo> fotos,
    List<String> pecasDisponiveis,
    String cidade,
    String estado,
    Double latitude,
    Double longitude,

    // Vendedor completo
    UUID perfilVendedorId,
    String nomeVendedor,
    String telefoneVendedor,
    String urlLogoVendedor,
    Boolean vendedorVerificado,
    Double ratingVendedor,
    Integer totalAvaliacoesVendedor,

    // Timestamps
    LocalDateTime criadoEm,
    LocalDateTime publicadoEm,
    LocalDateTime expiraEm,
    LocalDateTime vendidoEm
) {}
