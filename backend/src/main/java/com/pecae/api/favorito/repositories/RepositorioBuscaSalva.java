package com.pecae.api.favorito.repositories;

import com.pecae.api.favorito.entities.BuscaSalva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RepositorioBuscaSalva extends JpaRepository<BuscaSalva, UUID> {

    Page<BuscaSalva> findByUsuarioIdOrderByCriadaEmDesc(UUID usuarioId, Pageable pageable);

    List<BuscaSalva> findByAtivaTrue();
}
