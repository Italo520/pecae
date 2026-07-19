package com.pecae.api.notificacao.repositories;

import com.pecae.api.notificacao.entities.Notificacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repositório para acesso aos dados da entidade Notificacao.
 */
@Repository
public interface RepositorioNotificacao extends JpaRepository<Notificacao, UUID> {

    /**
     * Busca todas as notificações de um usuário de forma paginada.
     */
    Page<Notificacao> findByUsuarioId(UUID usuarioId, Pageable pageable);

    /**
     * Busca notificações de um usuário filtrando por status de leitura de forma paginada.
     */
    Page<Notificacao> findByUsuarioIdAndLida(UUID usuarioId, boolean lida, Pageable pageable);

    /**
     * Marca todas as notificações não lidas de um usuário como lidas.
     */
    @Modifying
    @Query("UPDATE Notificacao n SET n.lida = true WHERE n.usuario.id = :usuarioId AND n.lida = false")
    void marcarTodasComoLidas(UUID usuarioId);
}
