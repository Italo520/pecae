package com.pecae.api.notificacao.repositories;

import com.pecae.api.notificacao.entities.LogNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repositório para acesso aos dados da entidade LogNotificacao.
 */
@Repository
public interface RepositorioLogNotificacao extends JpaRepository<LogNotificacao, UUID> {
}
