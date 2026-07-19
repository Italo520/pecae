package com.pecae.api.notificacao.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.notificacao.dtos.request.RegistrarTokenPushRequest;
import com.pecae.api.notificacao.dtos.response.RespostaNotificacao;
import com.pecae.api.notificacao.entities.Notificacao;
import com.pecae.api.usuario.entities.TokenPush;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import com.pecae.api.notificacao.jobs.JobEnvioNotificacao;
import com.pecae.api.notificacao.mappers.MapperNotificacao;
import com.pecae.api.notificacao.repositories.RepositorioNotificacao;
import com.pecae.api.notificacao.repositories.RepositorioTokenPush;
import com.pecae.api.notificacao.services.IServicoNotificacao;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Implementação do serviço de gerenciamento de notificações.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ServicoNotificacaoImpl implements IServicoNotificacao {

    private final UsuarioRepository usuarioRepository;
    private final RepositorioNotificacao repositorioNotificacao;
    private final RepositorioTokenPush repositorioTokenPush;
    private final JobEnvioNotificacao jobEnvioNotificacao;
    private final MapperNotificacao mapperNotificacao;

    @Override
    @Transactional
    public void registrarTokenPush(UUID usuarioId, RegistrarTokenPushRequest request) {
        log.info("Registrando token push para o usuário {}", usuarioId);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário", "id", usuarioId));

        Optional<TokenPush> tokenExistenteOpt = repositorioTokenPush.findByToken(request.getToken());

        if (tokenExistenteOpt.isPresent()) {
            TokenPush tokenExistente = tokenExistenteOpt.get();
            if (tokenExistente.getUsuario().getId().equals(usuarioId)) {
                // Apenas atualiza info do dispositivo se mudou
                tokenExistente.setInfoDispositivo(request.getInfoDispositivo());
                repositorioTokenPush.save(tokenExistente);
                log.info("Token push atualizado com sucesso para o usuário {}", usuarioId);
            } else {
                // O dispositivo mudou de dono, desvincula do anterior e associa ao novo
                log.info("Token push associado ao usuário {} pertencia ao usuário {}. Reassociando.", usuarioId, tokenExistente.getUsuario().getId());
                tokenExistente.setUsuario(usuario);
                tokenExistente.setInfoDispositivo(request.getInfoDispositivo());
                repositorioTokenPush.save(tokenExistente);
            }
        } else {
            // Novo token
            TokenPush novoToken = TokenPush.builder()
                    .usuario(usuario)
                    .token(request.getToken())
                    .infoDispositivo(request.getInfoDispositivo())
                    .build();
            repositorioTokenPush.save(novoToken);
            log.info("Novo token push registrado para o usuário {}", usuarioId);
        }
    }

    @Override
    @Transactional
    public void removerTokenPush(String token) {
        log.info("Removendo token push");
        repositorioTokenPush.findByToken(token)
                .ifPresent(tokenPush -> {
                    repositorioTokenPush.delete(tokenPush);
                    log.info("Token push removido com sucesso");
                });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaNotificacao> listarNotificacoes(UUID usuarioId, Pageable pageable) {
        log.info("Listando notificações para o usuário {}", usuarioId);
        return repositorioNotificacao.findByUsuarioId(usuarioId, pageable)
                .map(mapperNotificacao::paraRespostaNotificacao);
    }

    @Override
    @Transactional
    public void marcarComoLida(UUID notificacaoId, UUID usuarioId) {
        log.info("Marcando notificação {} como lida pelo usuário {}", notificacaoId, usuarioId);
        Notificacao notificacao = repositorioNotificacao.findById(notificacaoId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Notificação", "id", notificacaoId));

        if (!notificacao.getUsuario().getId().equals(usuarioId)) {
            log.warn("Tentativa de alteração não autorizada de notificação. Usuário: {}, Dono: {}", usuarioId, notificacao.getUsuario().getId());
            throw new ExcecaoNegocio("Você não tem permissão para modificar esta notificação", HttpStatus.FORBIDDEN);
        }

        notificacao.setLida(true);
        repositorioNotificacao.save(notificacao);
        log.info("Notificação {} marcada como lida com sucesso", notificacaoId);
    }

    @Override
    @Transactional
    public void marcarTodasComoLidas(UUID usuarioId) {
        log.info("Marcando todas as notificações como lidas para o usuário {}", usuarioId);
        repositorioNotificacao.marcarTodasComoLidas(usuarioId);
        log.info("Todas as notificações do usuário {} foram marcadas como lidas", usuarioId);
    }

    @Override
    public void despacharNotificacao(UUID usuarioId, String titulo, String conteudo, TipoNotificacao tipo, String urlAcao, Set<CanalNotificacao> canais) {
        log.info("Enviando solicitação de despacho de notificação para o usuário {}. Tipo: {}, Canais: {}", usuarioId, tipo, canais);
        jobEnvioNotificacao.executar(usuarioId, titulo, conteudo, tipo, urlAcao, canais);
    }
}
