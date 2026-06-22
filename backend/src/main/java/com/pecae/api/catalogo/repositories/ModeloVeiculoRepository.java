package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.ModeloVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModeloVeiculoRepository extends JpaRepository<ModeloVeiculo, UUID> {
    List<ModeloVeiculo> findAllByMarcaIdAndAtivoTrueOrderByNomeAsc(UUID marcaId);
}
