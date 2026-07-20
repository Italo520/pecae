package com.pecae.api.notificacao.services;

import com.pecae.api.notificacao.dtos.request.RegistrarTokenPushRequest;
import com.pecae.api.notificacao.dtos.response.RespostaNotificacao;
import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;
import java.util.UUID;

/**
 * Interface que define as operações de negócio para gerenciamento de tokens push
 * e processamento/envio de notificações.
 */
public interface IServicoNotificacao {

    /**
     * Registra ou atualiza um token de push notification para um usuário.
     *
     * @param usuarioId ID do usuário.
     * @param request   DTO contendo o token e informações do dispositivo.
     */
    void registrarTokenPush(UUID usuarioId, RegistrarTokenPushRequest request);

    /**
     * Desvincula um token de push notification do sistema.
     *
     * @param token O token a ser removido.
     */
    void removerTokenPush(String token);

    /**
     * Lista as notificações de um usuário de forma paginada.
     *
     * @param usuarioId ID do usuário dono das notificações.
     * @param pageable  Configurações de paginação.
     * @return Página de notificações.
     */
    Page<RespostaNotificacao> listarNotificacoes(UUID usuarioId, Pageable pageable);

    /**
     * Marca uma notificação in-app como lida.
     *
     * @param notificacaoId ID da notificação.
     * @param usuarioId     ID do usuário dono para fins de autorização.
     */
    void marcarComoLida(UUID notificacaoId, UUID usuarioId);

    /**
     * Marca todas as notificações não lidas de um usuário como lidas.
     *
     * @param usuarioId ID do usuário.
     */
    void marcarTodasComoLidas(UUID usuarioId);

    /**
     * Orquestra o envio assíncrono de notificações em múltiplos canais (APP, PUSH, EMAIL).
     *
     * @param usuarioId ID do usuário destinatário.
     * @param titulo    Título da notificação.
     * @param conteudo  Corpo/Conteúdo textual.
     * @param tipo      Tipo de notificação (SISTEMA, CHAT, etc).
     * @param urlAcao   URL opcional para ações/links rápidos.
     * @param canais    Conjunto de canais de destino da notificação.
     */
    void despacharNotificacao(UUID usuarioId, String titulo, String conteudo, TipoNotificacao tipo, String urlAcao, Set<CanalNotificacao> canais);
}
