package com.pecae.api.anuncio.dtos;

/**
 * DTO de sugestão de autocomplete para a barra de busca.
 * Retorna marcas e modelos que correspondem ao termo digitado.
 */
public record RespostaSugestaoAutocomplete(
    String id,
    String text,
    TipoSugestao type
) {
    public enum TipoSugestao {
        BRAND,
        MODEL
    }
}
