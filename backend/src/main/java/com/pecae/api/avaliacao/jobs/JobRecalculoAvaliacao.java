package com.pecae.api.avaliacao.jobs;

import com.pecae.api.avaliacao.repositories.AvaliacaoRepository;
import com.pecae.api.vendedor.repositories.EstatisticasVendedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobRecalculoAvaliacao {

    private final AvaliacaoRepository avaliacaoRepository;
    private final EstatisticasVendedorRepository estatisticasVendedorRepository;

    @Async
    @Transactional
    public CompletableFuture<Void> recalcularEstatisticasAsync(UUID vendedorId) {
        try {
            // Calcula novas estatísticas
            Map<String, Object> stats = avaliacaoRepository.calcularEstatisticasVendedor(vendedorId);
            
            long total = 0L;
            double media = 0.0;

            if (stats != null) {
                Object totalObj = stats.get("total");
                Object mediaObj = stats.get("media");

                if (totalObj instanceof Number) {
                    total = ((Number) totalObj).longValue();
                }
                if (mediaObj instanceof Number) {
                    media = ((Number) mediaObj).doubleValue();
                }
            }

            // Arredonda média para 1 casa decimal
            double mediaArredondada = Math.round(media * 10.0) / 10.0;
            int totalInt = (int) total;

            // Busca as estatísticas atuais e atualiza
            estatisticasVendedorRepository.findByPerfilVendedorId(vendedorId).ifPresent(estatisticas -> {
                estatisticas.setTotalAvaliacoes(totalInt);
                estatisticas.setMediaAvaliacao(mediaArredondada);
                estatisticasVendedorRepository.save(estatisticas);
                log.info("Recálculo concluído para Vendedor {}: Total {}, Média {}", vendedorId, totalInt, mediaArredondada);
            });
            
        } catch (Exception e) {
            log.error("Erro ao recalcular estatísticas de avaliação para Vendedor {}", vendedorId, e);
        }
        
        return CompletableFuture.completedFuture(null);
    }
}
