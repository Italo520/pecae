package com.pecae.api.notificacao.providers.impl;

import com.pecae.api.notificacao.exceptions.ExcecaoPush;
import com.pecae.api.notificacao.providers.IProvedorPush;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implementação do provedor de Push Notifications utilizando a API oficial do Expo.
 */
@Slf4j
@Service
public class ProvedorPushExpo implements IProvedorPush {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private final RestTemplate restTemplate;

    public ProvedorPushExpo(@Autowired(required = false) RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder != null ? restTemplateBuilder.build() : new RestTemplate();
    }

    @Override
    public void enviar(List<String> tokens, String titulo, String corpo, Map<String, Object> dados) {
        if (tokens == null || tokens.isEmpty()) {
            log.info("[PUSH EXPO] Nao ha tokens para envio.");
            return;
        }

        log.info("[PUSH EXPO] Preparando envio de notificação para {} tokens.", tokens.size());

        List<PayloadMensagemExpo> mensagens = new ArrayList<>();
        for (String token : tokens) {
            // Expo requer tokens no formato ExponentPushToken[...] ou expo-token
            if (token != null && !token.trim().isEmpty()) {
                mensagens.add(new PayloadMensagemExpo(token, titulo, corpo, dados));
            }
        }

        if (mensagens.isEmpty()) {
            log.warn("[PUSH EXPO] Todos os tokens fornecidos eram invalidos ou vazios.");
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<PayloadMensagemExpo>> request = new HttpEntity<>(mensagens, headers);

        ResponseEntity<String> response;
        try {
            response = restTemplate.postForEntity(EXPO_PUSH_URL, request, String.class);
        } catch (Exception e) {
            log.error("[PUSH EXPO] Exceção de rede ou erro na chamada para o Expo: {}", e.getMessage(), e);
            throw new ExcecaoPush("Falha na comunicação com o serviço Expo Push", e);
        }

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("[PUSH EXPO] Notificação enviada com sucesso para a API do Expo. Resposta: {}", response.getBody());
        } else {
            log.error("[PUSH EXPO] Erro retornado pela API do Expo. Status: {}, Resposta: {}", response.getStatusCode().value(), response.getBody());
            throw new ExcecaoPush("Falha ao enviar push via Expo. Status: " + response.getStatusCode().value());
        }
    }

    /**
     * Classe utilitária interna para representar o payload do Expo.
     */
    private static class PayloadMensagemExpo {
        public final String to;
        public final String title;
        public final String body;
        public final Map<String, Object> data;

        public PayloadMensagemExpo(String to, String title, String body, Map<String, Object> data) {
            this.to = to;
            this.title = title;
            this.body = body;
            this.data = data;
        }
    }
}
