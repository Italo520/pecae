package com.pecae.api.chat.repositories;

import com.pecae.api.chat.entities.MensagemChat;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RepositorioMensagemChat extends JpaRepository<MensagemChat, UUID> {

    @Query("""
        SELECT m FROM MensagemChat m
        WHERE m.sala.id = :salaId
          AND m.deletada = false
        ORDER BY m.criadaEm DESC, m.id DESC
        """)
    List<MensagemChat> buscarMensagensIniciais(
        @Param("salaId") UUID salaId,
        Pageable pageable
    );

    @Query("""
        SELECT m FROM MensagemChat m
        WHERE m.sala.id = :salaId
          AND m.deletada = false
          AND (CAST(:cursorCriadoEm AS java.time.LocalDateTime) IS NULL OR m.criadaEm < :cursorCriadoEm
               OR (m.criadaEm = :cursorCriadoEm AND m.id < :cursorId))
        ORDER BY m.criadaEm DESC, m.id DESC
        """)
    List<MensagemChat> buscarMensagensPorCursor(
        @Param("salaId") UUID salaId,
        @Param("cursorCriadoEm") LocalDateTime cursorCriadoEm,
        @Param("cursorId") UUID cursorId,
        Pageable pageable
    );

    java.util.Optional<MensagemChat> findFirstBySalaIdAndDeletadaFalseOrderByCriadaEmDescIdDesc(UUID salaId);
}
