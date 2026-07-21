package com.pecae.api.anuncio.dtos;

public record FiltrosAnuncioQuery(
    String marcaId,
    String modeloId,
    String cidade,
    String estado,
    String search,
    Double latitude,
    Double longitude,
    Integer maxDistanciaKm,
    Integer pagina,
    Integer tamanho,
    Integer page,
    Integer size
) {
    // Construtor compacto para definir valores padrão e suporte a page/size
    public FiltrosAnuncioQuery {
        if (pagina == null) {
            pagina = (page != null) ? page : 0;
        }
        if (tamanho == null) {
            tamanho = (size != null) ? size : 20;
        }
        if (pagina < 0) {
            pagina = 0;
        }
        if (tamanho <= 0) {
            tamanho = 20;
        } else if (tamanho > 50) {
            tamanho = 50;
        }
    }

    // Construtor alternativo para manter retrocompatibilidade com chamadas de 6 parâmetros
    public FiltrosAnuncioQuery(String marcaId, String modeloId, String cidade, String estado, Integer pagina, Integer tamanho) {
        this(marcaId, modeloId, cidade, estado, null, null, null, null, pagina, tamanho, pagina, tamanho);
    }
}
