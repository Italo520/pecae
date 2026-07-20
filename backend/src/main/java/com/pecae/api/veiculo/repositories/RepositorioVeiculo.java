package com.pecae.api.veiculo.repositories;

import com.pecae.api.veiculo.entities.Veiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepositorioVeiculo extends JpaRepository<Veiculo, UUID> {

    Page<Veiculo> findAllByPerfilVendedorId(UUID perfilVendedorId, Pageable pageable);

    boolean existsByPlaca(String placa);

    boolean existsByPlacaAndIdNot(String placa, UUID id);

    Optional<Veiculo> findByIdAndPerfilVendedorId(UUID id, UUID perfilVendedorId);
}
