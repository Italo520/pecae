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
        JOIN seller_profiles sp ON a.seller_profile_id = sp.id
        JOIN users u ON sp.user_id = u.id
        CROSS JOIN LATERAL (
            SELECT CASE 
                WHEN CAST(:lat AS double precision) IS NOT NULL 
                 AND CAST(:lng AS double precision) IS NOT NULL 
                 AND v.lat IS NOT NULL 
                 AND v.lng IS NOT NULL 
                THEN (6371 * acos(least(1.0, greatest(-1.0, cos(radians(CAST(:lat AS double precision))) * cos(radians(v.lat)) * cos(radians(v.lng) - radians(CAST(:lng AS double precision))) + sin(radians(CAST(:lat AS double precision))) * sin(radians(v.lat))))))
                ELSE 0 END AS distancia
        ) d
        WHERE a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
          AND sp.deleted_at IS NULL AND u.status = 'ACTIVE'
          AND (:marcaId IS NULL OR :marcaId = '' OR v.marca_nome = :marcaId)
          AND (:modeloId IS NULL OR :modeloId = '' OR v.modelo_nome = :modeloId)
          AND (:cidade IS NULL OR :cidade = '' OR LOWER(v.city) = LOWER(:cidade))
          AND (:estado IS NULL OR :estado = '' OR LOWER(v.state) = LOWER(:estado))
          AND (:search IS NULL OR :search = '' OR a.search_vector @@ to_tsquery('portuguese', :search))
          AND (CAST(:lat AS double precision) IS NULL OR CAST(:lng AS double precision) IS NULL OR v.lat IS NULL OR v.lng IS NULL OR :maxDistancia IS NULL OR d.distancia <= :maxDistancia)
        ORDER BY 
          CASE WHEN CAST(:lat AS double precision) IS NULL OR CAST(:lng AS double precision) IS NULL OR v.lat IS NULL OR v.lng IS NULL THEN 1 ELSE 0 END ASC,
          d.distancia ASC,
          a.published_at DESC
        """,
        countQuery = """
        SELECT count(*) FROM listings a
        JOIN vehicles v ON a.vehicle_id = v.id
        JOIN seller_profiles sp ON a.seller_profile_id = sp.id
        JOIN users u ON sp.user_id = u.id
        CROSS JOIN LATERAL (
            SELECT CASE 
                WHEN CAST(:lat AS double precision) IS NOT NULL 
                 AND CAST(:lng AS double precision) IS NOT NULL 
                 AND v.lat IS NOT NULL 
                 AND v.lng IS NOT NULL 
                THEN (6371 * acos(least(1.0, greatest(-1.0, cos(radians(CAST(:lat AS double precision))) * cos(radians(v.lat)) * cos(radians(v.lng) - radians(CAST(:lng AS double precision))) + sin(radians(CAST(:lat AS double precision))) * sin(radians(v.lat))))))
                ELSE 0 END AS distancia
        ) d
        WHERE a.status = 'PUBLISHED'
          AND a.deleted_at IS NULL
          AND sp.deleted_at IS NULL AND u.status = 'ACTIVE'
          AND (:marcaId IS NULL OR :marcaId = '' OR v.marca_nome = :marcaId)
          AND (:modeloId IS NULL OR :modeloId = '' OR v.modelo_nome = :modeloId)
          AND (:cidade IS NULL OR :cidade = '' OR LOWER(v.city) = LOWER(:cidade))
          AND (:estado IS NULL OR :estado = '' OR LOWER(v.state) = LOWER(:estado))
          AND (:search IS NULL OR :search = '' OR a.search_vector @@ to_tsquery('portuguese', :search))
          AND (CAST(:lat AS double precision) IS NULL OR CAST(:lng AS double precision) IS NULL OR v.lat IS NULL OR v.lng IS NULL OR :maxDistancia IS NULL OR d.distancia <= :maxDistancia)
        """,
        nativeQuery = true)
    Page<Anuncio> buscarPublicados(
        @Param("marcaId") String marcaId,
        @Param("modeloId") String modeloId,
        @Param("cidade") String cidade,
        @Param("estado") String estado,
        @Param("search") String search,
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("maxDistancia") Integer maxDistancia,
        Pageable pageable
    );

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Anuncio a WHERE a.perfilVendedor.id = :perfilVendedorId AND a.status IN ('PUBLICADO', 'PENDENTE') AND (a.veiculo.id = :veiculoId OR (LOWER(a.titulo) = LOWER(:titulo) AND LOWER(a.descricao) = LOWER(:descricao)))")
    boolean existsByPerfilVendedorIdAndAtivoAndVeiculoOuTituloEDescricao(
        @Param("perfilVendedorId") UUID perfilVendedorId, 
        @Param("veiculoId") UUID veiculoId, 
        @Param("titulo") String titulo, 
        @Param("descricao") String descricao
    );

    // Métodos para buscar por ID do Veículo
    Optional<Anuncio> findByVeiculoId(UUID veiculoId);
    Optional<Anuncio> findByVeiculoIdAndPerfilVendedorId(UUID veiculoId, UUID perfilVendedorId);

    // Listar anúncios por status (fila de moderação)
    @Query(value = "SELECT l.* FROM listings l JOIN vehicles v ON l.vehicle_id = v.id WHERE l.status = 'PENDING' AND l.deleted_at IS NULL AND v.deleted_at IS NULL ORDER BY l.created_at ASC",
           countQuery = "SELECT count(*) FROM listings l JOIN vehicles v ON l.vehicle_id = v.id WHERE l.status = 'PENDING' AND l.deleted_at IS NULL AND v.deleted_at IS NULL",
           nativeQuery = true)
    Page<Anuncio> findAllByStatus(@Param("status") StatusAnuncio status, Pageable pageable);

    // Buscar anúncio por ID garantindo que não está deletado e vendedor não está deletado
    Optional<Anuncio> findByIdAndStatus(UUID id, StatusAnuncio status);

    // Listar anúncios de um vendedor específico por status (ex: rascunhos aguardando aprovação do vendedor)
    java.util.List<Anuncio> findByPerfilVendedorIdAndStatus(UUID perfilVendedorId, StatusAnuncio status);

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
