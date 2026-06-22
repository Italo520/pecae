package com.pecae.api.compartilhado.paginacao;

import java.util.List;

/**
 * Record genérico para respostas paginadas.
 * Encapsula dados, metadados de página e total de registros.
 *
 * @param <T> Tipo dos elementos na página
 */
public record RespostaPagina<T>(
        List<T> dados,
        int pagina,
        int tamanho,
        long totalElementos,
        int totalPaginas,
        boolean primeira,
        boolean ultima
) {

    /**
     * Método fábrica a partir de um Page do Spring.
     */
    public static <T> RespostaPagina<T> aPartirDe(org.springframework.data.domain.Page<T> springPage) {
        return new RespostaPagina<>(
                springPage.getContent(),
                springPage.getNumber(),
                springPage.getSize(),
                springPage.getTotalElements(),
                springPage.getTotalPages(),
                springPage.isFirst(),
                springPage.isLast()
        );
    }
}
