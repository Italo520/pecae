package com.pecae.api.notificacao.providers;

import java.util.List;
import java.util.Map;

/**
 * Interface Strategy para provedores externos de envio de Push Notifications.
 */
public interface IProvedorPush {

    /**
     * Envia uma notificação push para uma lista de tokens de dispositivos.
     *
     * @param tokens Lista de tokens dos destinatários.
     * @param titulo Título da notificação.
     * @param corpo  Conteúdo de texto da notificação.
     * @param dados  Metadados ou carga útil adicional (ex: deep links).
     */
    void enviar(List<String> tokens, String titulo, String corpo, Map<String, Object> dados);
}
