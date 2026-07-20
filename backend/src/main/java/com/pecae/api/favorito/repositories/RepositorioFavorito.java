package com.pecae.api.favorito.repositories;

import com.pecae.api.favorito.entities.Favorito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface RepositorioFavorito extends JpaRepository<Favorito, UUID> {

    @Query("""
        SELECT f FROM Favorito f
        JOIN FETCH f.anuncio a
        JOIN FETCH a.veiculo v
        WHERE f.usuario.id = :usuarioId
        ORDER BY f.criadoEm DESC
    """)
    Page<Favorito> buscarPorUsuarioId(@Param("usuarioId") UUID usuarioId, Pageable pageable);

    boolean existsByUsuarioIdAndAnuncioId(UUID usuarioId, UUID anuncioId);

    void deleteByUsuarioIdAndAnuncioId(UUID usuarioId, UUID anuncioId);
}
