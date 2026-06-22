package com.pecae.api.vendedor.repositories;

import com.pecae.api.vendedor.entities.VerificacaoVendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificacaoVendedorRepository extends JpaRepository<VerificacaoVendedor, UUID> {
    Optional<VerificacaoVendedor> findByPerfilVendedorId(UUID perfilVendedorId);
}
