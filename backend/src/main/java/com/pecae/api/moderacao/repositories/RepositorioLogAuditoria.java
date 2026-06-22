package com.pecae.api.moderacao.repositories;

import com.pecae.api.moderacao.entities.LogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface RepositorioLogAuditoria extends JpaRepository<LogAuditoria, UUID> {

    @Query("""
        SELECT l FROM LogAuditoria l
        JOIN FETCH l.moderador
        ORDER BY l.criadoEm DESC
    """)
    Page<LogAuditoria> buscarTodosComModerador(Pageable pageable);

    @Query("""
        SELECT l FROM LogAuditoria l
        JOIN FETCH l.moderador
        WHERE l.moderador.id = :moderadorId
        ORDER BY l.criadoEm DESC
    """)
    Page<LogAuditoria> buscarPorModerador(@Param("moderadorId") UUID moderadorId, Pageable pageable);
}
