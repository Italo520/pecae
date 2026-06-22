package com.pecae.api.anuncio.dtos;

import java.util.UUID;

public record FiltrosAnuncioQuery(
    UUID marcaId,
    UUID modeloId,
    String cidade,
    String estado,
    Integer pagina,
    Integer tamanho
) {
    // Construtor compacto para definir valores padrão caso venham nulos
    public FiltrosAnuncioQuery {
        if (pagina == null || pagina < 0) {
            pagina = 0;
        }
        if (tamanho == null || tamanho <= 0) {
            tamanho = 20;
        } else if (tamanho > 50) {
            tamanho = 50;
        }
    }
}
