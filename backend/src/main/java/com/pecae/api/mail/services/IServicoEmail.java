package com.pecae.api.mail.services;

/**
 * Interface que define o contrato para envio de e-mails no sistema.
 */
public interface IServicoEmail {

    /**
     * Envia um e-mail simples em formato texto.
     */
    void enviar(String destinatario, String assunto, String corpo);

    /**
     * Envia um e-mail com conteúdo formatado em HTML.
     */
    void enviarHtml(String destinatario, String assunto, String htmlCorpo);
}
