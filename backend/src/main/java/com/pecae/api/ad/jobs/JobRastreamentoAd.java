package com.pecae.api.ad.jobs;

import com.pecae.api.ad.entities.CliqueAd;
import com.pecae.api.ad.entities.CriativoAd;
import com.pecae.api.ad.entities.ImpressaoAd;
import com.pecae.api.ad.repositories.RepositorioCliqueAd;
import com.pecae.api.ad.repositories.RepositorioCriativoAd;
import com.pecae.api.ad.repositories.RepositorioImpressaoAd;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Job assíncrono para processamento e persistência das métricas de publicidade (impressões e cliques) em segundo plano.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JobRastreamentoAd {

    private final RepositorioImpressaoAd repositorioImpressao;
    private final RepositorioCliqueAd repositorioClique;
    private final RepositorioCriativoAd repositorioCriativo;

    /**
     * Registra uma exibição (impressão) de criativo de forma assíncrona.
     */
    @Async
    public void registrarImpressao(UUID criativoId, String ip, String userAgent) {
        try {
            CriativoAd criativo = repositorioCriativo.findById(criativoId)
                    .orElseThrow(() -> new IllegalArgumentException("Criativo não encontrado com id: " + criativoId));

            repositorioImpressao.save(ImpressaoAd.builder()
                    .criativo(criativo)
                    .ipUsuario(ip)
                    .userAgent(userAgent)
                    .build());
        } catch (Exception e) {
            log.error("Falha ao registrar impressão assíncrona para criativo {}: {}", criativoId, e.getMessage());
        }
    }

    /**
     * Registra um clique de criativo de forma assíncrona.
     */
    @Async
    public void registrarClique(UUID criativoId, String ip) {
        try {
            CriativoAd criativo = repositorioCriativo.findById(criativoId)
                    .orElseThrow(() -> new IllegalArgumentException("Criativo não encontrado com id: " + criativoId));

            repositorioClique.save(CliqueAd.builder()
                    .criativo(criativo)
                    .ipUsuario(ip)
                    .build());
        } catch (Exception e) {
            log.error("Falha ao registrar clique assíncrono para criativo {}: {}", criativoId, e.getMessage());
        }
    }
}
