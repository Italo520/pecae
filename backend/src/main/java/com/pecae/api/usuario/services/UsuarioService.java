package com.pecae.api.usuario.services;

import com.pecae.api.usuario.dtos.AtualizarUsuarioRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.PlataformaPush;
import com.pecae.api.usuario.entities.enums.TipoUsuario;

import java.util.Optional;
import java.util.UUID;

/**
 * Interface que define os contratos de serviços para gerenciamento de usuários.
 */
public interface UsuarioService {

    /**
     * Retorna a entidade de usuário pelo seu ID ou lança erro 404 se não encontrado.
     *
     * @param id ID do usuário.
     * @return Entidade Usuario.
     */
    Usuario buscarEntidadePorId(UUID id);

    /**
     * Retorna a entidade de usuário pelo seu e-mail.
     *
     * @param email E-mail do usuário.
     * @return Optional contendo a entidade Usuario.
     */
    Optional<Usuario> buscarEntidadePorEmail(String email);

    /**
     * Retorna o perfil mapeado em DTO para exibição pública ou do próprio usuário.
     *
     * @param id ID do usuário.
     * @return DTO com dados do usuário.
     */
    UsuarioResponse obterPerfilUsuario(UUID id);

    /**
     * Cria um novo usuário no banco de dados.
     *
     * @param usuario Entidade contendo os dados a serem criados.
     * @return Entidade Usuario criada.
     */
    Usuario criarEntidade(Usuario usuario);

    /**
     * Atualiza dados de perfil do usuário.
     *
     * @param id      ID do usuário.
     * @param request DTO com as atualizações desejadas.
     * @return DTO de resposta atualizado.
     */
    UsuarioResponse atualizarUsuario(UUID id, AtualizarUsuarioRequest request);

    /**
     * Atualiza o papel de acesso (tipo) de um usuário específico.
     *
     * @param id       ID do usuário.
     * @param novoTipo Novo tipo de usuário.
     */
    void atualizarTipoUsuario(UUID id, TipoUsuario novoTipo);

    /**
     * Registra ou atualiza o token de push para notificações push.
     *
     * @param usuarioId  ID do usuário.
     * @param token      Valor do token.
     * @param plataforma Plataforma associada.
     */
    void salvarTokenPush(UUID usuarioId, String token, PlataformaPush plataforma);
}
