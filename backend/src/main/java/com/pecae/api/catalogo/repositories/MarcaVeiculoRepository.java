package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.MarcaVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarcaVeiculoRepository extends JpaRepository<MarcaVeiculo, UUID> {
    List<MarcaVeiculo> findAllByAtivoTrueOrderByNomeAsc();
    Optional<MarcaVeiculo> findByNomeIgnoreCase(String nome);
    List<MarcaVeiculo> findByNomeContainingIgnoreCaseAndAtivoTrue(String nome);
}
