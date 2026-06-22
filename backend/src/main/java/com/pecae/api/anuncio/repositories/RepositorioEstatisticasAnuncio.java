package com.pecae.api.anuncio.repositories;

import com.pecae.api.anuncio.entities.EstatisticasAnuncio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RepositorioEstatisticasAnuncio extends JpaRepository<EstatisticasAnuncio, UUID> {

    // Buscar estatísticas pelo ID do anúncio
    Optional<EstatisticasAnuncio> findByAnuncioId(UUID anuncioId);
}
