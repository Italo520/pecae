package com.pecae.api.anuncio.repositories;

import com.pecae.api.anuncio.entities.VisualizacaoAnuncio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;

public interface RepositorioVisualizacaoAnuncio extends JpaRepository<VisualizacaoAnuncio, UUID> {

    // Verificar se o IP já visualizou recentemente (deduplicação)
    boolean existsByAnuncioIdAndHashIpAndVistoAfter(UUID anuncioId, String hashIp, LocalDateTime desde);

    // Contar views no período para cálculo de stats
    long countByAnuncioIdAndVistoAfter(UUID anuncioId, LocalDateTime desde);
}
