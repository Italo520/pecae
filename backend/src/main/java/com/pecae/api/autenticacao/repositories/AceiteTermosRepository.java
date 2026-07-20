package com.pecae.api.autenticacao.repositories;

import com.pecae.api.autenticacao.entities.AceiteTermos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repositório para operações de acesso a dados da entidade AceiteTermos.
 */
@Repository
public interface AceiteTermosRepository extends JpaRepository<AceiteTermos, UUID> {
}
