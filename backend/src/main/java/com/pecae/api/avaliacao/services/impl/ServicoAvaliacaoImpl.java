package com.pecae.api.avaliacao.services.impl;

import com.pecae.api.avaliacao.dtos.request.CriarAvaliacaoRequest;
import com.pecae.api.avaliacao.dtos.response.RespostaAvaliacao;
import com.pecae.api.avaliacao.entities.Avaliacao;
import com.pecae.api.avaliacao.jobs.JobRecalculoAvaliacao;
import com.pecae.api.avaliacao.mappers.MapperAvaliacao;
import com.pecae.api.avaliacao.repositories.AvaliacaoRepository;
import com.pecae.api.avaliacao.services.IServicoAvaliacao;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicoAvaliacaoImpl implements IServicoAvaliacao {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilVendedorRepository perfilVendedorRepository;
    private final JobRecalculoAvaliacao jobRecalculoAvaliacao;
    private final MapperAvaliacao mapper;

    @Override
    @Transactional
    public RespostaAvaliacao submeterAvaliacao(UUID avaliadorId, CriarAvaliacaoRequest request) {
        Usuario avaliador = usuarioRepository.findById(avaliadorId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Avaliador não encontrado."));

        PerfilVendedor vendedor = perfilVendedorRepository.findById(request.vendedorId())
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Vendedor não encontrado."));

        // RN-REV-01: Não avaliar a si mesmo
        if (vendedor.getUsuario().getId().equals(avaliadorId)) {
            throw new ExcecaoNegocio("Você não pode avaliar o seu próprio perfil de vendedor.");
        }

        // RN-REV-02: Upsert (atualiza se já existir, senão cria)
        Avaliacao avaliacao = avaliacaoRepository
            .findByAvaliadorIdAndVendedorId(avaliadorId, request.vendedorId())
            .orElseGet(() -> Avaliacao.builder()
                .avaliador(avaliador)
                .vendedor(vendedor)
                .deletada(false)
                .build());

        avaliacao.setNota(request.nota());
        avaliacao.setComentario(request.comentario());
        avaliacao.setDeletada(false); // Caso tenha sido "deletada" antes, reativa

        avaliacao = avaliacaoRepository.save(avaliacao);

        // RN-REV-04: Recálculo assíncrono
        jobRecalculoAvaliacao.recalcularEstatisticasAsync(vendedor.getId());

        return mapper.paraResposta(avaliacao);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaAvaliacao> listarAvaliacoesDoVendedor(UUID vendedorId, Pageable pageable) {
        return avaliacaoRepository.buscarPorVendedorId(vendedorId, pageable)
            .map(mapper::paraResposta);
    }

    @Override
    @Transactional
    public void deletarAvaliacao(UUID avaliadorId, UUID avaliacaoId) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Avaliação não encontrada."));

        if (!avaliacao.getAvaliador().getId().equals(avaliadorId)) {
            throw new ExcecaoNegocio("Você só pode deletar as suas próprias avaliações.", HttpStatus.FORBIDDEN);
        }

        avaliacao.setDeletada(true);
        avaliacaoRepository.save(avaliacao);

        // Dispara o recálculo
        jobRecalculoAvaliacao.recalcularEstatisticasAsync(avaliacao.getVendedor().getId());
    }
}
