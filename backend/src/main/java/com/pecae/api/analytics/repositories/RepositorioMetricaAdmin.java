package com.pecae.api.analytics.repositories;

import com.pecae.api.analytics.entities.MetricaAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepositorioMetricaAdmin extends JpaRepository<MetricaAdmin, UUID> {
    Optional<MetricaAdmin> findByDataReferencia(LocalDate dataReferencia);
    List<MetricaAdmin> findByDataReferenciaBetweenOrderByDataReferenciaAsc(LocalDate inicio, LocalDate fim);
}
