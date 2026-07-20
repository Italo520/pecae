package com.pecae.api.vendedor.repositories;

import com.pecae.api.vendedor.entities.EstatisticasVendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EstatisticasVendedorRepository extends JpaRepository<EstatisticasVendedor, UUID> {
    Optional<EstatisticasVendedor> findByPerfilVendedorId(UUID perfilVendedorId);
}
