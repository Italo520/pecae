package com.pecae.api.vendedor.services.impl;

import com.pecae.api.vendedor.dtos.*;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.entities.VerificacaoVendedor;
import com.pecae.api.vendedor.entities.enums.StatusVerificacao;
import com.pecae.api.vendedor.mappers.IVendedorMapper;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import com.pecae.api.vendedor.repositories.EstatisticasVendedorRepository;
import com.pecae.api.vendedor.repositories.VerificacaoVendedorRepository;
import com.pecae.api.vendedor.services.VendedorService;
import com.pecae.api.vendedor.services.EstatisticasVendedorService;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendedorServiceImpl implements VendedorService {

    private final PerfilVendedorRepository perfilVendedorRepository;
    private final EstatisticasVendedorRepository estatisticasVendedorRepository;
    private final VerificacaoVendedorRepository verificacaoVendedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final IVendedorMapper vendedorMapper;
    private final EstatisticasVendedorService estatisticasVendedorService;

    @Override
    @Transactional
    public RespostaPerfilVendedor criarPerfil(UUID usuarioId, CriarVendedorRequest request) {
        log.info("Criando perfil de vendedor para o usuário: {}", usuarioId);

        if (perfilVendedorRepository.existsByUsuarioId(usuarioId)) {
            throw new ExcecaoNegocio("O usuário já possui um perfil de vendedor cadastrado.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        PerfilVendedor perfil = vendedorMapper.toEntity(request);
        perfil.setUsuario(usuario);

        PerfilVendedor perfilSalvo = perfilVendedorRepository.save(perfil);

        estatisticasVendedorService.inicializarEstatisticas(perfilSalvo);

        return montarRespostaCompleta(perfilSalvo);
    }

    @Override
    @Transactional
    public RespostaPerfilVendedor atualizarPerfil(UUID usuarioId, AtualizarVendedorRequest request) {
        log.info("Atualizando perfil de vendedor para o usuário: {}", usuarioId);

        PerfilVendedor perfil = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado para o usuário informado."));

        vendedorMapper.updateEntityFromDto(request, perfil);
        PerfilVendedor perfilAtualizado = perfilVendedorRepository.save(perfil);

        return montarRespostaCompleta(perfilAtualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaPerfilVendedor obterPerfilPorUsuarioId(UUID usuarioId) {
        PerfilVendedor perfil = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado para o usuário informado."));
        return montarRespostaCompleta(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaPerfilVendedor obterPerfilPorId(UUID id) {
        PerfilVendedor perfil = perfilVendedorRepository.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado."));
        return montarRespostaCompleta(perfil);
    }

    @Override
    @Transactional
    public RespostaVerificacaoVendedor solicitarVerificacao(UUID usuarioId) {
        log.info("Solicitando verificação do perfil de vendedor para o usuário: {}", usuarioId);

        PerfilVendedor perfil = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado para o usuário informado."));

        boolean possuiPendenteOuAprovado = verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())
                .map(v -> v.getStatus() == StatusVerificacao.PENDENTE || v.getStatus() == StatusVerificacao.APROVADO)
                .orElse(false);

        if (possuiPendenteOuAprovado) {
            throw new ExcecaoNegocio("A verificação do vendedor já está pendente ou já foi aprovada.");
        }

        VerificacaoVendedor verificacao = verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())
                .orElseGet(() -> VerificacaoVendedor.builder().perfilVendedor(perfil).build());

        verificacao.setStatus(StatusVerificacao.PENDENTE);
        verificacao.setSolicitadoEm(LocalDateTime.now());
        verificacao.setResolvidoEm(null);
        verificacao.setMotivoRejeicao(null);

        VerificacaoVendedor verificacaoSalva = verificacaoVendedorRepository.save(verificacao);

        return vendedorMapper.toVerificationResponse(verificacaoSalva);
    }

    @Override
    @Transactional
    public RespostaPerfilVendedor atualizarLogo(UUID usuarioId, String urlLogo) {
        log.info("Atualizando logo do perfil de vendedor para o usuário: {}", usuarioId);

        PerfilVendedor perfil = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado para o usuário informado."));

        perfil.setUrlLogo(urlLogo);
        PerfilVendedor perfilSalvo = perfilVendedorRepository.save(perfil);

        return montarRespostaCompleta(perfilSalvo);
    }

    @Override
    @Transactional
    public RespostaPerfilVendedor atualizarBanner(UUID usuarioId, String urlBanner) {
        log.info("Atualizando banner do perfil de vendedor para o usuário: {}", usuarioId);

        PerfilVendedor perfil = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado para o usuário informado."));

        perfil.setUrlBanner(urlBanner);
        PerfilVendedor perfilSalvo = perfilVendedorRepository.save(perfil);

        return montarRespostaCompleta(perfilSalvo);
    }

    @Override
    @Transactional
    public void excluirPerfil(UUID usuarioId) {
        log.info("Excluindo perfil de vendedor para o usuário: {}", usuarioId);

        PerfilVendedor perfil = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Perfil de vendedor não encontrado para o usuário informado."));

        estatisticasVendedorRepository.findByPerfilVendedorId(perfil.getId())
                .ifPresent(estatisticasVendedorRepository::delete);

        verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())
                .ifPresent(verificacaoVendedorRepository::delete);

        perfilVendedorRepository.delete(perfil);
    }

    private RespostaPerfilVendedor montarRespostaCompleta(PerfilVendedor perfil) {
        RespostaEstatisticasVendedor respostaEstatisticas = estatisticasVendedorRepository.findByPerfilVendedorId(perfil.getId())
                .map(vendedorMapper::toStatsResponse)
                .orElse(null);

        RespostaVerificacaoVendedor respostaVerificacao = verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())
                .map(vendedorMapper::toVerificationResponse)
                .orElse(null);

        return vendedorMapper.toResponseWithDetails(perfil, respostaEstatisticas, respostaVerificacao);
    }
}
