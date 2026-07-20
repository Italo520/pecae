package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.VersaoVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VersaoVeiculoRepository extends JpaRepository<VersaoVeiculo, UUID> {
    List<VersaoVeiculo> findAllByModeloIdAndAtivoTrueOrderByNomeAsc(UUID modeloId);
}
