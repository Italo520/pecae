package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.MarcaVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarcaVeiculoRepository extends JpaRepository<MarcaVeiculo, UUID> {
    List<MarcaVeiculo> findAllByAtivoTrueOrderByNomeAsc();
    Optional<MarcaVeiculo> findByNomeIgnoreCase(String nome);
    @Query(value = "SELECT * FROM vehicle_brands WHERE LOWER(name) LIKE LOWER(CONCAT('%', :nome, '%')) AND active = true ORDER BY name ASC LIMIT 5", nativeQuery = true)
    List<MarcaVeiculo> findTop5ByNomeContainingIgnoreCaseAndAtivoTrue(@Param("nome") String nome);
}
