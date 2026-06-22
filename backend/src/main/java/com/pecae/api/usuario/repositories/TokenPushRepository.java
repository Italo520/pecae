package com.pecae.api.usuario.repositories;

import com.pecae.api.usuario.entities.TokenPush;
import com.pecae.api.usuario.entities.enums.PlataformaPush;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de acesso a dados da entidade TokenPush.
 */
@Repository
public interface TokenPushRepository extends JpaRepository<TokenPush, UUID> {

    /**
     * Busca um token de push associado a um usuário e plataforma.
     *
     * @param usuarioId  ID do usuário.
     * @param plataforma Plataforma.
     * @return Um Optional contendo o token se encontrado.
     */
    Optional<TokenPush> findByUsuarioIdAndPlataforma(UUID usuarioId, PlataformaPush plataforma);
}
