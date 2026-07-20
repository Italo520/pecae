package com.pecae.api.autenticacao.repositories;

import com.pecae.api.autenticacao.entities.TokenVerificacaoEmail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de acesso a dados da entidade TokenVerificacaoEmail.
 */
@Repository
public interface TokenVerificacaoEmailRepository extends JpaRepository<TokenVerificacaoEmail, UUID> {

    /**
     * Busca um token de verificação de e-mail pelo seu hash.
     *
     * @param tokenHash Hash do token.
     * @return Um Optional contendo o token se encontrado.
     */
    Optional<TokenVerificacaoEmail> findByTokenHash(String tokenHash);
}
