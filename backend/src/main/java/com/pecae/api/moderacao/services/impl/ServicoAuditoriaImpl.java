package com.pecae.api.moderacao.services.impl;

import com.pecae.api.moderacao.entities.LogAuditoria;
import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import com.pecae.api.moderacao.repositories.RepositorioLogAuditoria;
import com.pecae.api.moderacao.services.IServicoAuditoria;
import com.pecae.api.usuario.entities.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicoAuditoriaImpl implements IServicoAuditoria {

    private final RepositorioLogAuditoria repositorioLogAuditoria;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void registrarAcao(Usuario moderador, AcaoModeracao acao, String tipoEntidade, UUID idEntidade, String motivo) {
        LogAuditoria logAuditoria = LogAuditoria.builder()
            .moderador(moderador)
            .acao(acao)
            .tipoEntidade(tipoEntidade)
            .idEntidade(idEntidade)
            .motivo(motivo)
            .build();

        repositorioLogAuditoria.save(logAuditoria);
        log.info("Log de auditoria registrado - Moderador: {}, Ação: {}, Entidade: {} (ID: {})",
            moderador.getId(), acao, tipoEntidade, idEntidade);
    }
}
