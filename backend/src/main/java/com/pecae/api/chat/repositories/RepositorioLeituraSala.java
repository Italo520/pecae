package com.pecae.api.chat.repositories;

import com.pecae.api.chat.entities.LeituraSala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepositorioLeituraSala extends JpaRepository<LeituraSala, UUID> {

    Optional<LeituraSala> findBySalaIdAndUsuarioId(UUID salaId, UUID usuarioId);
}
