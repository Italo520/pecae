package com.pecae.api.notificacao.repositories;

import com.pecae.api.usuario.entities.TokenPush;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para acesso aos dados da entidade TokenPush.
 */
@Repository
public interface RepositorioTokenPush extends JpaRepository<TokenPush, UUID> {

    /**
     * Busca todos os tokens de push vinculados a um usuário.
     */
    List<TokenPush> findByUsuarioId(UUID usuarioId);

    /**
     * Busca um token de push específico.
     */
    Optional<TokenPush> findByToken(String token);
}
