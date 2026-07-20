package com.pecae.api.mail.services.impl;

import com.pecae.api.mail.services.IServicoEmail;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Implementação do serviço de envio de e-mails.
 * Utiliza o JavaMailSender do Spring Mail se disponível;
 * caso contrário, registra o e-mail nos logs de desenvolvimento.
 */
@Slf4j
@Service
public class ServicoEmailImpl implements IServicoEmail {

    private final JavaMailSender mailSender;

    public ServicoEmailImpl(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
        if (mailSender == null) {
            log.warn("JavaMailSender não está configurado. Os e-mails serão registrados apenas no console/log.");
        }
    }

    @Override
    public void enviar(String destinatario, String assunto, String corpo) {
        log.info("[E-MAIL SIMPLES] Enviando para: {}, Assunto: {}", destinatario, assunto);
        log.debug("[E-MAIL SIMPLES] Corpo: {}", corpo);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(destinatario);
                message.setSubject(assunto);
                message.setText(corpo);
                mailSender.send(message);
                log.info("[E-MAIL SIMPLES] E-mail enviado com sucesso para: {}", destinatario);
            } catch (Exception e) {
                log.error("[E-MAIL SIMPLES] Falha ao enviar e-mail para: {}. Erro: {}", destinatario, e.getMessage());
            }
        } else {
            log.info("[E-MAIL SIMPLES - SIMULADO] E-mail simulado com sucesso para: {}", destinatario);
        }
    }

    @Override
    public void enviarHtml(String destinatario, String assunto, String htmlCorpo) {
        log.info("[E-MAIL HTML] Enviando para: {}, Assunto: {}", destinatario, assunto);
        log.debug("[E-MAIL HTML] HTML: {}", htmlCorpo);

        if (mailSender != null) {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setTo(destinatario);
                helper.setSubject(assunto);
                helper.setText(htmlCorpo, true);
                mailSender.send(message);
                log.info("[E-MAIL HTML] E-mail enviado com sucesso para: {}", destinatario);
            } catch (Exception e) {
                log.error("[E-MAIL HTML] Falha ao enviar e-mail HTML para: {}. Erro: {}", destinatario, e.getMessage());
            }
        } else {
            log.info("[E-MAIL HTML - SIMULADO] E-mail HTML simulado com sucesso para: {}", destinatario);
        }
    }
}
