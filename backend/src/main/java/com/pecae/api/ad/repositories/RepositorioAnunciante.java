package com.pecae.api.ad.repositories;

import com.pecae.api.ad.entities.Anunciante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RepositorioAnunciante extends JpaRepository<Anunciante, UUID> {
    boolean existsByEmailContato(String emailContato);
}
