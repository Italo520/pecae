package com.pecae.api.notificacao.jobs;

import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.mail.services.IServicoEmail;
import com.pecae.api.notificacao.entities.LogNotificacao;
import com.pecae.api.notificacao.entities.Notificacao;
import com.pecae.api.notificacao.entities.TokenPush;
import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import com.pecae.api.notificacao.entities.enums.StatusNotificacao;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import com.pecae.api.notificacao.providers.IProvedorPush;
import com.pecae.api.notificacao.repositories.RepositorioLogNotificacao;
import com.pecae.api.notificacao.repositories.RepositorioNotificacao;
import com.pecae.api.notificacao.repositories.RepositorioTokenPush;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Job assíncrono para orquestrar o envio de notificações em múltiplos canais.
 * Evita o bloqueio da thread principal da API.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JobEnvioNotificacao {

    private final UsuarioRepository usuarioRepository;
    private final RepositorioNotificacao repositorioNotificacao;
    private final RepositorioTokenPush repositorioTokenPush;
    private final RepositorioLogNotificacao repositorioLogNotificacao;
    private final IProvedorPush provedorPush;
    private final IServicoEmail servicoEmail;

    /**
     * Envia assincronamente as notificações para o usuário nos canais solicitados.
     */
    @Async
    public void executar(UUID usuarioId, String titulo, String conteudo, TipoNotificacao tipo, String urlAcao, Set<CanalNotificacao> canais) {
        log.info("[JOB NOTIFICACAO] Iniciando processamento de notificação assíncrona para o usuário {}. Canais: {}", usuarioId, canais);

        if (canais == null || canais.isEmpty()) {
            log.warn("[JOB NOTIFICACAO] Nenhum canal de notificação foi informado.");
            return;
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElse(null);

        if (usuario == null) {
            log.error("[JOB NOTIFICACAO] Usuário {} não foi encontrado para envio de notificações.", usuarioId);
            return;
        }

        // 1. Notificação In-App
        if (canais.contains(CanalNotificacao.APP)) {
            try {
                Notificacao notificacao = Notificacao.builder()
                        .usuario(usuario)
                        .titulo(titulo)
                        .conteudo(conteudo)
                        .tipo(tipo)
                        .urlAcao(urlAcao)
                        .lida(false)
                        .build();
                repositorioNotificacao.save(notificacao);
                log.info("[JOB NOTIFICACAO] Notificação In-App salva com sucesso para o usuário {}", usuarioId);
            } catch (Exception e) {
                log.error("[JOB NOTIFICACAO] Erro ao salvar notificação In-App para o usuário {}: {}", usuarioId, e.getMessage(), e);
            }
        }

        // 2. Push Notification (Expo)
        if (canais.contains(CanalNotificacao.PUSH)) {
            try {
                List<TokenPush> tokensPush = repositorioTokenPush.findByUsuarioId(usuarioId);
                if (tokensPush != null && !tokensPush.isEmpty()) {
                    List<String> tokens = tokensPush.stream()
                            .map(TokenPush::getToken)
                            .toList();

                    Map<String, Object> dados = Map.of(
                            "type", tipo.name(),
                            "actionUrl", urlAcao != null ? urlAcao : ""
                    );

                    provedorPush.enviar(tokens, titulo, conteudo, dados);

                    LogNotificacao logNotif = LogNotificacao.builder()
                            .usuario(usuario)
                            .canal(CanalNotificacao.PUSH)
                            .status(StatusNotificacao.ENVIADA)
                            .build();
                    repositorioLogNotificacao.save(logNotif);
                    log.info("[JOB NOTIFICACAO] Push enviado e registrado com sucesso para o usuário {}", usuarioId);
                } else {
                    log.info("[JOB NOTIFICACAO] Usuário {} não possui tokens push cadastrados. Ignorando canal PUSH.", usuarioId);
                }
            } catch (Exception e) {
                log.error("[JOB NOTIFICACAO] Erro ao enviar notificação push via Expo para o usuário {}: {}", usuarioId, e.getMessage());
                try {
                    LogNotificacao logFalha = LogNotificacao.builder()
                            .usuario(usuario)
                            .canal(CanalNotificacao.PUSH)
                            .status(StatusNotificacao.FALHA)
                            .mensagemErro(e.getMessage() != null ? e.getMessage() : "Erro desconhecido ao enviar push")
                            .build();
                    repositorioLogNotificacao.save(logFalha);
                } catch (Exception ex) {
                    log.error("[JOB NOTIFICACAO] Falha ao registrar log de erro de PUSH para usuário {}: {}", usuarioId, ex.getMessage());
                }
            }
        }

        // 3. E-mail
        if (canais.contains(CanalNotificacao.EMAIL)) {
            try {
                if (usuario.getEmail() != null && !usuario.getEmail().trim().isEmpty()) {
                    servicoEmail.enviar(usuario.getEmail(), titulo, conteudo);

                    LogNotificacao logNotif = LogNotificacao.builder()
                            .usuario(usuario)
                            .canal(CanalNotificacao.EMAIL)
                            .status(StatusNotificacao.ENVIADA)
                            .build();
                    repositorioLogNotificacao.save(logNotif);
                    log.info("[JOB NOTIFICACAO] E-mail enviado e registrado com sucesso para o usuário {}", usuarioId);
                } else {
                    log.warn("[JOB NOTIFICACAO] Usuário {} não possui e-mail cadastrado. Ignorando canal EMAIL.", usuarioId);
                }
            } catch (Exception e) {
                log.error("[JOB NOTIFICACAO] Erro ao enviar e-mail para o usuário {}: {}", usuarioId, e.getMessage());
                try {
                    LogNotificacao logFalha = LogNotificacao.builder()
                            .usuario(usuario)
                            .canal(CanalNotificacao.EMAIL)
                            .status(StatusNotificacao.FALHA)
                            .mensagemErro(e.getMessage() != null ? e.getMessage() : "Erro desconhecido ao enviar e-mail")
                            .build();
                    repositorioLogNotificacao.save(logFalha);
                } catch (Exception ex) {
                    log.error("[JOB NOTIFICACAO] Falha ao registrar log de erro de e-mail para usuário {}: {}", usuarioId, ex.getMessage());
                }
            }
        }
    }
}
