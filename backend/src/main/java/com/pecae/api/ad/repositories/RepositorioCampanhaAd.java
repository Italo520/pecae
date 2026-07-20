package com.pecae.api.ad.repositories;

import com.pecae.api.ad.entities.CampanhaAd;
import com.pecae.api.ad.entities.enums.StatusCampanha;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RepositorioCampanhaAd extends JpaRepository<CampanhaAd, UUID> {
    Page<CampanhaAd> findByAnuncianteId(UUID anuncianteId, Pageable pageable);
    Page<CampanhaAd> findByStatus(StatusCampanha status, Pageable pageable);
}
