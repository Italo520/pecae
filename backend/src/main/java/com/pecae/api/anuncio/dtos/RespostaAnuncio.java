package com.pecae.api.anuncio.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record RespostaAnuncio(
    UUID id,
    String titulo,
    String status,
    Integer visualizacoes,
    String marcaNome,
    String modeloNome,
    String versaoNome,
    Integer anoFabricacao,
    String cor,
    String cidade,
    String estado,
    String urlFotoPrincipal,
    UUID perfilVendedorId,
    String nomeVendedor,
    Boolean vendedorVerificado,
    LocalDateTime publicadoEm,
    Boolean patrocinadoAtivo
) {}
