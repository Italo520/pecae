package com.pecae.api.analytics.jobs;

import com.pecae.api.analytics.services.IServicoAnalytics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobAgregacaoAnalytics {

    private final IServicoAnalytics servicoAnalytics;

    @Scheduled(cron = "0 0 */6 * * *") // A cada 6 horas
    public void agregarDadosAnalytics() {
        log.info("Iniciando job de agregação de Analytics...");
        try {
            servicoAnalytics.realizarAgregacaoDiaria();
            log.info("Agregação de Analytics realizada com sucesso.");
        } catch (Exception e) {
            log.error("Erro ao realizar agregação de Analytics", e);
        }
    }
}
