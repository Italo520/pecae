package com.pecae.api.autenticacao.repositories;

import com.pecae.api.autenticacao.entities.TokenAtualizacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de acesso a dados da entidade TokenAtualizacao.
 */
@Repository
public interface TokenAtualizacaoRepository extends JpaRepository<TokenAtualizacao, UUID> {

    /**
     * Busca um refresh token pelo hash do token.
     *
     * @param tokenHash Hash do token.
     * @return Um Optional contendo o token se encontrado.
     */
    Optional<TokenAtualizacao> findByTokenHash(String tokenHash);

    /**
     * Busca todos os refresh tokens não revogados associados a um usuário.
     *
     * @param usuarioId ID do usuário.
     * @return Lista de TokenAtualizacao ativos.
     */
    List<TokenAtualizacao> findByUsuarioIdAndRevogadoEmIsNull(UUID usuarioId);

    /**
     * Remove todos os refresh tokens associados a um usuário.
     *
     * @param usuarioId ID do usuário.
     */
    void deleteByUsuarioId(UUID usuarioId);
}
