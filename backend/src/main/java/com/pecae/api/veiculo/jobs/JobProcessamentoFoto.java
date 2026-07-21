package com.pecae.api.veiculo.jobs;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
public class JobProcessamentoFoto {

    @Async
    public CompletableFuture<Void> processarAsync(UUID fotoId) {
        log.info("[JOB] Iniciando processamento assíncrono da foto: {}", fotoId);
        try {
            // Simula um tempo de processamento de imagem
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("[JOB] Processamento da foto interrompido: {}", fotoId, e);
        }
        log.info("[JOB] Processamento da foto {} concluído (simulado).", fotoId);
        return CompletableFuture.completedFuture(null);
    }
}
