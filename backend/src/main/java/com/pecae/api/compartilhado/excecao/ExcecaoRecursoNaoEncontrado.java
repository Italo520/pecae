package com.pecae.api.compartilhado.excecao;

import org.springframework.http.HttpStatus;

/**
 * Exceção para recurso não encontrado (HTTP 404).
 */
public class ExcecaoRecursoNaoEncontrado extends ExcecaoNegocio {

    public ExcecaoRecursoNaoEncontrado(String recurso, String campo, Object valor) {
        super(String.format("%s não encontrado com %s: %s", recurso, campo, valor),
                HttpStatus.NOT_FOUND);
    }

    public ExcecaoRecursoNaoEncontrado(String mensagem) {
        super(mensagem, HttpStatus.NOT_FOUND);
    }
}
