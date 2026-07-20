package com.pecae.api.ad.repositories;

import com.pecae.api.ad.entities.CliqueAd;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RepositorioCliqueAd extends JpaRepository<CliqueAd, UUID> {
    long countByCriativoId(UUID criativoId);
}
