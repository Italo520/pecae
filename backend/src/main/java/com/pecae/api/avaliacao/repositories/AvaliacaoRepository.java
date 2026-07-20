package com.pecae.api.avaliacao.repositories;

import com.pecae.api.avaliacao.entities.Avaliacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AvaliacaoRepository extends JpaRepository<Avaliacao, UUID> {

    // Busca avaliação existente para o upsert (RN-REV-02)
    Optional<Avaliacao> findByAvaliadorIdAndVendedorId(UUID avaliadorId, UUID vendedorId);

    // Listagem paginada para o perfil do vendedor (apenas avaliações não deletadas)
    @Query("""
        SELECT a FROM Avaliacao a
        JOIN FETCH a.avaliador
        WHERE a.vendedor.id = :vendedorId
          AND a.deletada = false
        ORDER BY a.criadaEm DESC
        """)
    Page<Avaliacao> buscarPorVendedorId(
        @Param("vendedorId") UUID vendedorId,
        Pageable pageable
    );

    // Cálculo da média e total de avaliações não deletadas
    @Query("""
        SELECT new map(
            COUNT(a) as total,
            COALESCE(AVG(a.nota), 0.0) as media
        )
        FROM Avaliacao a
        WHERE a.vendedor.id = :vendedorId
          AND a.deletada = false
        """)
    Map<String, Object> calcularEstatisticasVendedor(@Param("vendedorId") UUID vendedorId);
}
