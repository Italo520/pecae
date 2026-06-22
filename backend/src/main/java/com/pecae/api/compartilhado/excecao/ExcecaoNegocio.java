package com.pecae.api.compartilhado.excecao;

import org.springframework.http.HttpStatus;

/**
 * Exceção base para erros de lógica de negócio.
 * Permite definir o status HTTP e uma mensagem personalizada.
 */
public class ExcecaoNegocio extends RuntimeException {

    private final HttpStatus status;

    public ExcecaoNegocio(String mensagem) {
        super(mensagem);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public ExcecaoNegocio(String mensagem, HttpStatus status) {
        super(mensagem);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
