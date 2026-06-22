package com.pecae.api.vendedor.repositories;

import com.pecae.api.vendedor.entities.PerfilVendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PerfilVendedorRepository extends JpaRepository<PerfilVendedor, UUID> {
    Optional<PerfilVendedor> findByUsuarioId(UUID usuarioId);
    boolean existsByUsuarioId(UUID usuarioId);
}
