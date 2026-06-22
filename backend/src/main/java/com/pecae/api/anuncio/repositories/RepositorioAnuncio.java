package com.pecae.api.anuncio.repositories;

import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface RepositorioAnuncio extends JpaRepository<Anuncio, UUID> {

    // Listagem pública (PUBLICADO, sem vendedor deletado — LGPD)
    @Query("""
        SELECT a FROM Anuncio a
        JOIN FETCH a.veiculo v
        JOIN FETCH v.versao vs
        JOIN FETCH vs.modelo mo
        JOIN FETCH mo.marca ma
        WHERE a.status = com.pecae.api.anuncio.entities.enums.StatusAnuncio.PUBLICADO
          AND a.perfilVendedor.deletadoEm IS NULL
          AND (:marcaId IS NULL OR ma.id = :marcaId)
          AND (:modeloId IS NULL OR mo.id = :modeloId)
          AND (:cidade IS NULL OR LOWER(v.cidade) = LOWER(:cidade))
          AND (:estado IS NULL OR LOWER(v.estado) = LOWER(:estado))
        ORDER BY a.publicadoEm DESC
    """)
    Page<Anuncio> buscarPublicados(
        @Param("marcaId") UUID marcaId,
        @Param("modeloId") UUID modeloId,
        @Param("cidade") String cidade,
        @Param("estado") String estado,
        Pageable pageable
    );

    // Buscar anúncio por ID garantindo que não está deletado e vendedor não está deletado
    Optional<Anuncio> findByIdAndStatus(UUID id, StatusAnuncio status);

    // Listar anúncios de um vendedor específico (painel do vendedor)
    Page<Anuncio> findAllByPerfilVendedorId(UUID perfilVendedorId, Pageable pageable);

    // Buscar anúncio e validar ownership do vendedor
    Optional<Anuncio> findByIdAndPerfilVendedorId(UUID id, UUID perfilVendedorId);

    // Query de atualização atômica para views
    @Modifying
    @Query("UPDATE Anuncio a SET a.visualizacoes = a.visualizacoes + 1 WHERE a.id = :id")
    void incrementarVisualizacoes(@Param("id") UUID id);
}
