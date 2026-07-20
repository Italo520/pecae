package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.AnoVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnoVeiculoRepository extends JpaRepository<AnoVeiculo, UUID> {
    List<AnoVeiculo> findAllByVersaoIdOrderByAnoDesc(UUID versaoId);
}
