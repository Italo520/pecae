package com.pecae.api.comprador.services;

import com.pecae.api.comprador.dtos.AtualizarCompradorRequest;
import com.pecae.api.comprador.dtos.ExcluirContaRequest;
import com.pecae.api.comprador.dtos.RespostaCompradorMe;

import java.util.UUID;

/**
 * Interface que define os contratos de serviços para gerenciamento de compradores.
 */
public interface CompradorService {

    /**
     * Retorna o perfil completo do comprador (dados básicos do usuário + PerfilComprador + preferências).
     *
     * @param usuarioId ID do usuário.
     * @return DTO com os dados consolidados do perfil.
     */
    RespostaCompradorMe obterPerfilPorUsuarioId(UUID usuarioId);

    /**
     * Atualiza dados de perfil do comprador (e opcionalmente preferências de notificação).
     *
     * @param usuarioId ID do usuário logado.
     * @param request DTO com as atualizações desejadas.
     * @return DTO com os dados atualizados.
     */
    RespostaCompradorMe atualizarPerfil(UUID usuarioId, AtualizarCompradorRequest request);

    /**
     * Executa a inativação/exclusão lógica (soft delete) da conta do usuário.
     *
     * @param usuarioId ID do usuário logado.
     * @param request DTO com a senha atual para validação.
     */
    void excluirConta(UUID usuarioId, ExcluirContaRequest request);
}
