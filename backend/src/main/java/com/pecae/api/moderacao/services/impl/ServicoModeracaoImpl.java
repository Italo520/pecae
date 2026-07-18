package com.pecae.api.moderacao.services.impl;

import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.services.IServicoAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.Denuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.mappers.MapperDenuncia;
import com.pecae.api.denuncia.repositories.RepositorioDenuncia;
import com.pecae.api.moderacao.dtos.request.DecisaoModeracaoRequest;
import com.pecae.api.moderacao.dtos.response.RespostaLogAuditoria;
import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import com.pecae.api.moderacao.mappers.MapperModeracao;
import com.pecae.api.moderacao.repositories.RepositorioLogAuditoria;
import com.pecae.api.moderacao.services.IServicoAuditoria;
import com.pecae.api.moderacao.services.IServicoModeracao;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.mappers.MapperAnuncio;
import com.pecae.api.anuncio.dtos.RespostaAnuncio;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicoModeracaoImpl implements IServicoModeracao {

    private final RepositorioDenuncia repositorioDenuncia;
    private final RepositorioLogAuditoria repositorioLogAuditoria;
    private final UsuarioRepository usuarioRepository;
    private final IServicoAnuncio servicoAnuncio;
    private final IServicoAuditoria servicoAuditoria;
    private final MapperDenuncia mapperDenuncia;
    private final MapperModeracao mapperModeracao;
    private final RepositorioAnuncio repositorioAnuncio;
    private final MapperAnuncio mapperAnuncio;

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaDenuncia> listarDenunciasPendentes(Pageable pageable) {
        return repositorioDenuncia.findAllByStatus(StatusDenuncia.PENDENTE, pageable)
            .map(mapperDenuncia::paraResposta);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaAnuncio> listarAnunciosPendentes(Pageable pageable) {
        return repositorioAnuncio.findAllByStatus(StatusAnuncio.PENDENTE, pageable)
            .map(mapperAnuncio::paraResposta);
    }

    @Override
    @Transactional
    public void processarDenuncia(UUID moderadorId, UUID denunciaId, DecisaoModeracaoRequest request) {
        Usuario moderador = usuarioRepository.findById(moderadorId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Moderador não encontrado."));

        Denuncia denuncia = repositorioDenuncia.findById(denunciaId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Denúncia não encontrada."));

        if (denuncia.getStatus() != StatusDenuncia.PENDENTE) {
            throw new ExcecaoNegocio("Esta denúncia já foi processada.");
        }

        if (request.acao() == AcaoModeracao.RESOLVER_DENUNCIA) {
            denuncia.setStatus(StatusDenuncia.RESOLVIDA);
        } else if (request.acao() == AcaoModeracao.DESCARTAR_DENUNCIA) {
            denuncia.setStatus(StatusDenuncia.DESCARTADA);
        } else {
            throw new ExcecaoNegocio("Ação de moderação inválida para denúncias.");
        }

        repositorioDenuncia.save(denuncia);

        // Registrar auditoria
        servicoAuditoria.registrarAcao(
            moderador,
            request.acao(),
            "DENUNCIA",
            denunciaId,
            request.motivo()
        );
    }

    @Override
    @Transactional
    public void moderarAnuncio(UUID moderadorId, UUID anuncioId, DecisaoModeracaoRequest request) {
        Usuario moderador = usuarioRepository.findById(moderadorId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Moderador não encontrado."));

        if (request.acao() == AcaoModeracao.APROVAR_ANUNCIO) {
            servicoAnuncio.moderar(anuncioId, StatusAnuncio.PUBLICADO);
        } else if (request.acao() == AcaoModeracao.REJEITAR_ANUNCIO) {
            servicoAnuncio.moderar(anuncioId, StatusAnuncio.REJEITADO);
        } else {
            throw new ExcecaoNegocio("Ação de moderação inválida para anúncios.");
        }

        // Registrar auditoria
        servicoAuditoria.registrarAcao(
            moderador,
            request.acao(),
            "ANUNCIO",
            anuncioId,
            request.motivo()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaLogAuditoria> listarLogsAuditoria(Pageable pageable) {
        return repositorioLogAuditoria.buscarTodosComModerador(pageable)
            .map(mapperModeracao::paraRespostaLogAuditoria);
    }
}
