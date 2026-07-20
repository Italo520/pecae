package com.pecae.api.ad.repositories;

import com.pecae.api.ad.entities.CriativoAd;
import com.pecae.api.ad.entities.enums.PlacementAd;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface RepositorioCriativoAd extends JpaRepository<CriativoAd, UUID> {

    List<CriativoAd> findByCampanhaId(UUID campanhaId);

    @Query("SELECT c FROM CriativoAd c WHERE c.placement = :placement AND c.ativo = true " +
           "AND c.campanha.status = 'ATIVA' " +
           "AND c.campanha.dataInicio <= :hoje AND c.campanha.dataFim >= :hoje " +
           "ORDER BY c.prioridade DESC, c.criadoEm DESC")
    List<CriativoAd> findActiveCreativesForPlacement(
            @Param("placement") PlacementAd placement,
            @Param("hoje") LocalDate hoje,
            Pageable pageable
    );
}
