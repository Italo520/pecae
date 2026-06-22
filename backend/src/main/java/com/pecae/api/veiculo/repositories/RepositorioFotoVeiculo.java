package com.pecae.api.veiculo.repositories;

import com.pecae.api.veiculo.entities.FotoVeiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepositorioFotoVeiculo extends JpaRepository<FotoVeiculo, UUID> {

    List<FotoVeiculo> findAllByVeiculoIdOrderByOrdemAsc(UUID veiculoId);

    long countByVeiculoId(UUID veiculoId);
}
