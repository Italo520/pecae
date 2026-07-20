package com.pecae.api.comprador.repositories;

import com.pecae.api.comprador.entities.PreferenciasNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PreferenciasNotificacaoRepository extends JpaRepository<PreferenciasNotificacao, UUID> {
    Optional<PreferenciasNotificacao> findByUsuarioId(UUID usuarioId);
}
