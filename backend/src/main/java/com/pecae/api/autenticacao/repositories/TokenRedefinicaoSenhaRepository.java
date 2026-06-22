package com.pecae.api.autenticacao.repositories;

import com.pecae.api.autenticacao.entities.TokenRedefinicaoSenha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de acesso a dados da entidade TokenRedefinicaoSenha.
 */
@Repository
public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, UUID> {

    /**
     * Busca um token de redefinição de senha pelo seu hash.
     *
     * @param tokenHash Hash do token.
     * @return Um Optional contendo o token se encontrado.
     */
    Optional<TokenRedefinicaoSenha> findByTokenHash(String tokenHash);
}
