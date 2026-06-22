package com.pecae.api.usuario.repositories;

import com.pecae.api.usuario.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repositório para operações de acesso a dados da entidade Usuario.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {

    /**
     * Busca um usuário pelo e-mail.
     *
     * @param email E-mail do usuário.
     * @return Um Optional contendo o usuário se encontrado.
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Busca um usuário pelo telefone.
     *
     * @param telefone Telefone do usuário.
     * @return Um Optional contendo o usuário se encontrado.
     */
    Optional<Usuario> findByTelefone(String telefone);

    /**
     * Verifica se existe um usuário com o e-mail informado.
     *
     * @param email E-mail a ser verificado.
     * @return True se existir, false caso contrário.
     */
    boolean existsByEmail(String email);

    /**
     * Verifica se existe um usuário com o telefone informado.
     *
     * @param telefone Telefone a ser verificado.
     * @return True se existir, false caso contrário.
     */
    boolean existsByTelefone(String telefone);
}
