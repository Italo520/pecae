package com.pecae.api.notificacao.exceptions;

import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import org.springframework.http.HttpStatus;

/**
 * Exceção lançada quando ocorre um erro na comunicação ou resposta do provedor de Push Notifications.
 */
public class ExcecaoPush extends ExcecaoNegocio {

    public ExcecaoPush(String mensagem) {
        super(mensagem, HttpStatus.BAD_GATEWAY);
    }

    public ExcecaoPush(String mensagem, Throwable causa) {
        super(mensagem, HttpStatus.BAD_GATEWAY);
        initCause(causa);
    }
}
