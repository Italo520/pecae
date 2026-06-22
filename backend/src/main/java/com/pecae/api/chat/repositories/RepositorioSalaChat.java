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
}
