package com.pecae.api.anuncio.services.impl;

import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Máquina de estado para o ciclo de vida de um anúncio.
 * Padrão: State Pattern (GoF) — Define transições válidas entre status.
 */
@Component
public class MaquinaEstadoAnuncio {

    private static final Map<StatusAnuncio, List<StatusAnuncio>> TRANSICOES_VALIDAS = Map.of(
        StatusAnuncio.RASCUNHO,   List.of(StatusAnuncio.PENDENTE),
        StatusAnuncio.PENDENTE,   List.of(StatusAnuncio.PUBLICADO, StatusAnuncio.REJEITADO),
        StatusAnuncio.PUBLICADO,  List.of(StatusAnuncio.VENDIDO, StatusAnuncio.EXPIRADO, StatusAnuncio.PENDENTE, StatusAnuncio.PAUSADO),
        StatusAnuncio.REJEITADO,  List.of(StatusAnuncio.PENDENTE),
        StatusAnuncio.VENDIDO,    List.of(StatusAnuncio.PENDENTE),  // Re-submissão permitida
        StatusAnuncio.EXPIRADO,   List.of(StatusAnuncio.PENDENTE),
        StatusAnuncio.PAUSADO,    List.of(StatusAnuncio.PENDENTE, StatusAnuncio.VENDIDO, StatusAnuncio.EXPIRADO)
    );

    /**
     * Valida se a transição de status é permitida.
     * Lança ExcecaoNegocio se a transição for inválida.
     */
    public void validarTransicao(StatusAnuncio de, StatusAnuncio para) {
        if (de == para) return;
        List<StatusAnuncio> permitidos = TRANSICOES_VALIDAS.getOrDefault(de, List.of());
        if (!permitidos.contains(para)) {
            throw new ExcecaoNegocio(
                String.format("Transição inválida de status: não é possível alterar de %s para %s", de, para)
            );
        }
    }
}
