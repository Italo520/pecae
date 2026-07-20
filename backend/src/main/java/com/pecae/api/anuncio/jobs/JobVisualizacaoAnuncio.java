package com.pecae.api.anuncio.jobs;

import com.pecae.api.anuncio.entities.VisualizacaoAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioVisualizacaoAnuncio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobVisualizacaoAnuncio {

    private final RepositorioAnuncio repositorioAnuncio;
    private final RepositorioVisualizacaoAnuncio repositorioVisualizacao;
    private final StringRedisTemplate redisTemplate;

    @Async
    @Transactional
    public CompletableFuture<Void> registrarVisualizacaoAsync(UUID anuncioId, String ipBruto) {
        // 1. Calcular hash SHA-256 do IP para privacidade (LGPD)
        String hashIp = calcularHashSha256(ipBruto != null ? ipBruto : "unknown");

        // 2. Chave Redis para deduplicação: "view:{anuncioId}:{hashIp}"
        String chaveCache = String.format("view:%s:%s", anuncioId, hashIp);

        try {
            // 3. Verificar se já foi contabilizado na última hora via Redis
            Boolean jaContabilizado = redisTemplate.hasKey(chaveCache);
            if (Boolean.TRUE.equals(jaContabilizado)) {
                log.debug("[JOB-VIEW] View já contabilizada: anuncio={}, hash={}", anuncioId, hashIp.substring(0, 8));
                return CompletableFuture.completedFuture(null);
            }

            // 4. Verificar se o anúncio existe (prevenção de views para IDs inválidos)
            if (!repositorioAnuncio.existsById(anuncioId)) {
                log.warn("[JOB-VIEW] Anúncio inexistente: {}", anuncioId);
                return CompletableFuture.completedFuture(null);
            }

            // 5. Registrar log de view no DB
            VisualizacaoAnuncio view = VisualizacaoAnuncio.builder()
                .anuncio(repositorioAnuncio.getReferenceById(anuncioId))
                .hashIp(hashIp)
                .visto(LocalDateTime.now())
                .build();
            repositorioVisualizacao.save(view);

            // 6. Incrementar contador na entidade Anuncio (update atômico)
            repositorioAnuncio.incrementarVisualizacoes(anuncioId);

            // 7. Marcar no Redis com TTL de 1 hora
            redisTemplate.opsForValue().set(chaveCache, "1", Duration.ofHours(1));

            log.info("[JOB-VIEW] View registrada com sucesso para o anúncio={}", anuncioId);
        } catch (Exception e) {
            log.error("[JOB-VIEW] Erro ao registrar view para anuncio={}: {}", anuncioId, e.getMessage());
        }
        return CompletableFuture.completedFuture(null);
    }

    private String calcularHashSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Erro ao instanciar algoritmo SHA-256", e);
            return input; // Fallback
        }
    }
}
