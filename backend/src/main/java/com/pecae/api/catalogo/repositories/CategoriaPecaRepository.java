package com.pecae.api.catalogo.repositories;

import com.pecae.api.catalogo.entities.CategoriaPeca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoriaPecaRepository extends JpaRepository<CategoriaPeca, UUID> {
    List<CategoriaPeca> findAllByOrderByNomeAsc();
}
