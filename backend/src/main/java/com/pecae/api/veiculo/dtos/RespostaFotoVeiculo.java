package com.pecae.api.veiculo.dtos;

import java.util.UUID;

public record RespostaFotoVeiculo(
    UUID id,
    String urlFoto,
    String blurhash,
    Integer ordem,
    String tipo
) {}
