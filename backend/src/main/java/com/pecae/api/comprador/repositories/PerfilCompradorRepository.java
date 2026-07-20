package com.pecae.api.comprador.repositories;

import com.pecae.api.comprador.entities.PerfilComprador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilCompradorRepository extends JpaRepository<PerfilComprador, UUID> {
    Optional<PerfilComprador> findByUsuarioId(UUID usuarioId);
}
