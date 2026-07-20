package com.pecae.api.vendedor.jobs;

import com.pecae.api.vendedor.services.EstatisticasVendedorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class EstatisticasVendedorJob {

    private final EstatisticasVendedorService estatisticasVendedorService;

    @Async
    public void executarRecalculoAvaliacao(UUID perfilVendedorId) {
        log.info("Job assíncrono iniciado: Recalculando avaliação para o perfilVendedorId: {}", perfilVendedorId);
        try {
            estatisticasVendedorService.recalcularAvaliacao(perfilVendedorId);
            log.info("Job assíncrono concluído: Recálculo da avaliação finalizado para o perfilVendedorId: {}", perfilVendedorId);
        } catch (Exception e) {
            log.error("Job assíncrono falhou: Erro ao recalcular avaliação para o perfilVendedorId: {}", perfilVendedorId, e);
        }
    }
}
