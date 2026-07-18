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

    // Listagem pública (PUBLICADO, sem vendedor deletado — LGPD) com busca textual
    @Query(value = """
        SELECT a.* FROM listings a
        JOIN vehicles v ON a.vehicle_id = v.id
        JOIN vehicle_versions vs ON v.version_id = vs.id
        JOIN vehicle_models mo ON vs.model_id = mo.id
        JOIN vehicle_brands ma ON mo.brand_id = ma.id
        WHERE a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
          AND a.seller_profile_id IN (SELECT id FROM seller_profiles WHERE deleted_at IS NULL)
          AND (:marcaId IS NULL OR ma.id = CAST(:marcaId AS uuid))
          AND (:modeloId IS NULL OR mo.id = CAST(:modeloId AS uuid))
          AND (:cidade IS NULL OR :cidade = '' OR LOWER(v.city) = LOWER(:cidade))
          AND (:estado IS NULL OR :estado = '' OR LOWER(v.state) = LOWER(:estado))
          AND (:search IS NULL OR :search = '' OR a.search_vector @@ plainto_tsquery('portuguese', :search))
        ORDER BY a.published_at DESC
        """,
        countQuery = """
        SELECT count(*) FROM listings a
        JOIN vehicles v ON a.vehicle_id = v.id
        JOIN vehicle_versions vs ON v.version_id = vs.id
        JOIN vehicle_models mo ON vs.model_id = mo.id
        JOIN vehicle_brands ma ON mo.brand_id = ma.id
        WHERE a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
          AND a.seller_profile_id IN (SELECT id FROM seller_profiles WHERE deleted_at IS NULL)
          AND (:marcaId IS NULL OR ma.id = CAST(:marcaId AS uuid))
          AND (:modeloId IS NULL OR mo.id = CAST(:modeloId AS uuid))
          AND (:cidade IS NULL OR :cidade = '' OR LOWER(v.city) = LOWER(:cidade))
          AND (:estado IS NULL OR :estado = '' OR LOWER(v.state) = LOWER(:estado))
          AND (:search IS NULL OR :search = '' OR a.search_vector @@ plainto_tsquery('portuguese', :search))
        """,
        nativeQuery = true)
    Page<Anuncio> buscarPublicados(
        @Param("marcaId") UUID marcaId,
        @Param("modeloId") UUID modeloId,
        @Param("cidade") String cidade,
        @Param("estado") String estado,
        @Param("search") String search,
        Pageable pageable
    );

    // Métodos para buscar por ID do Veículo
    Optional<Anuncio> findByVeiculoId(UUID veiculoId);
    Optional<Anuncio> findByVeiculoIdAndPerfilVendedorId(UUID veiculoId, UUID perfilVendedorId);

    // Listar anúncios por status (fila de moderação)
    Page<Anuncio> findAllByStatus(StatusAnuncio status, Pageable pageable);

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

    long countByCriadoEmBetween(java.time.LocalDateTime inicio, java.time.LocalDateTime fim);

    long countByStatus(StatusAnuncio status);
}
