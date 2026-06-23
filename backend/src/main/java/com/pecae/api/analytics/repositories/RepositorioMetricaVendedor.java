package com.pecae.api.analytics.repositories;

import com.pecae.api.analytics.entities.MetricaVendedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepositorioMetricaVendedor extends JpaRepository<MetricaVendedor, UUID> {
    Optional<MetricaVendedor> findByVendedorIdAndDataReferencia(UUID vendedorId, LocalDate dataReferencia);
    List<MetricaVendedor> findByVendedorIdAndDataReferenciaBetweenOrderByDataReferenciaAsc(UUID vendedorId, LocalDate inicio, LocalDate fim);
}
