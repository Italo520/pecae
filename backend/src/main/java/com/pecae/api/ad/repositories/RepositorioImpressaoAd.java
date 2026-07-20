package com.pecae.api.ad.repositories;

import com.pecae.api.ad.entities.ImpressaoAd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RepositorioImpressaoAd extends JpaRepository<ImpressaoAd, UUID> {
    long countByCriativoId(UUID criativoId);
}
