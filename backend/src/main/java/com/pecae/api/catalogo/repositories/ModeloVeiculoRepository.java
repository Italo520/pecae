package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.ModeloVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModeloVeiculoRepository extends JpaRepository<ModeloVeiculo, UUID> {
    List<ModeloVeiculo> findAllByMarcaIdAndAtivoTrueOrderByNomeAsc(UUID marcaId);
    
    @Query(value = "SELECT * FROM vehicle_models WHERE LOWER(name) LIKE LOWER(CONCAT('%', :nome, '%')) AND active = true ORDER BY name ASC LIMIT 5", nativeQuery = true)
    List<ModeloVeiculo> findTop5ByNomeContainingIgnoreCaseAndAtivoTrue(@Param("nome") String nome);
}
