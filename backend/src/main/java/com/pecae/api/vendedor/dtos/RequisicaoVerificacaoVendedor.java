package com.pecae.api.vendedor.dtos;

import java.util.List;

public record RequisicaoVerificacaoVendedor(
    List<String> documentosUrls
) {}
