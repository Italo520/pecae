package com.pecae.api.chat.repositories;

import com.pecae.api.chat.entities.SalaChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RepositorioSalaChat extends JpaRepository<SalaChat, UUID> {

    @Query("""
        SELECT s FROM SalaChat s
        WHERE (s.comprador.id = :usuarioId OR s.vendedor.id = :usuarioId)
          AND s.ativa = true
        ORDER BY s.atualizadaEm DESC
        """)
    List<SalaChat> buscarSalasAtivasDoUsuario(@Param("usuarioId") UUID usuarioId);

    @Query(value = """
        SELECT
            CAST(s.id AS varchar) AS s_id,
            CAST(s.buyer_id AS varchar) AS s_buyer_id,
            CAST(s.seller_id AS varchar) AS s_seller_id,
            CAST(s.listing_id AS varchar) AS s_listing_id,
            CAST(s.vehicle_id AS varchar) AS s_vehicle_id,
            s.updated_at AS s_updated_at,
            lm.conteudo       AS ultima_msg_conteudo,
            lm.sender_id      AS ultima_msg_remetente_id,
            lm.created_at     AS ultima_msg_criada_em,
            COALESCE((
                SELECT COUNT(*)
                FROM chat_messages cm
                WHERE cm.chat_room_id = s.id
                  AND cm.sender_id <> :usuarioId
                  AND cm.created_at > COALESCE(lr.leu_em, '1970-01-01 00:00:00')
                  AND cm.deleted = false
            ), 0) AS nao_lidos
        FROM chat_rooms s
        LEFT JOIN LATERAL (
            SELECT conteudo, sender_id, created_at
            FROM chat_messages
            WHERE chat_room_id = s.id AND deleted = false
            ORDER BY created_at DESC, id DESC
            LIMIT 1
        ) lm ON true
        LEFT JOIN chat_room_reads lr
            ON lr.chat_room_id = s.id AND lr.user_id = :usuarioId
        WHERE (s.buyer_id = :usuarioId OR s.seller_id = :usuarioId)
          AND s.ativa = true
        ORDER BY s.updated_at DESC
        """, nativeQuery = true)
    List<Object[]> buscarSalasComResumo(@Param("usuarioId") UUID usuarioId);

    Optional<SalaChat> findByCompradorIdAndAnuncioId(UUID compradorId, UUID anuncioId);

    Optional<SalaChat> findByCompradorIdAndVeiculoId(UUID compradorId, UUID veiculoId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE SalaChat s SET s.atualizadaEm = :agora WHERE s.id = :salaId")
    void atualizarTimestamp(@Param("salaId") UUID salaId, @Param("agora") LocalDateTime agora);

    @Query("""
        SELECT COUNT(m) FROM MensagemChat m
        WHERE m.sala.id = :salaId
          AND m.remetente.id <> :usuarioId
          AND m.criadaEm > :leuEm
          AND m.deletada = false
        """)
    long contarNaoLidos(
        @Param("salaId") UUID salaId,
        @Param("usuarioId") UUID usuarioId,
        @Param("leuEm") LocalDateTime leuEm
    );

    // Contar chats iniciados de um vendedor no período
    long countByVendedorIdAndCriadaEmBetween(UUID vendedorId, LocalDateTime inicio, LocalDateTime fim);
}
