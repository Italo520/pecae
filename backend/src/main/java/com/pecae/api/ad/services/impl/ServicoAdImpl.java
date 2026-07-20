package com.pecae.api.ad.services.impl;

import com.pecae.api.ad.dtos.request.RequisicaoCriarAnunciante;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCampanha;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCriativo;
import com.pecae.api.ad.dtos.response.*;
import com.pecae.api.ad.entities.Anunciante;
import com.pecae.api.ad.entities.CampanhaAd;
import com.pecae.api.ad.entities.CriativoAd;
import com.pecae.api.ad.entities.enums.PlacementAd;
import com.pecae.api.ad.entities.enums.StatusCampanha;
import com.pecae.api.ad.mappers.MapperAd;
import com.pecae.api.ad.repositories.*;
import com.pecae.api.ad.services.IServicoAd;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicoAdImpl implements IServicoAd {

    private final RepositorioAnunciante repositorioAnunciante;
    private final RepositorioCampanhaAd repositorioCampanhaAd;
    private final RepositorioCriativoAd repositorioCriativoAd;
    private final RepositorioImpressaoAd repositorioImpressaoAd;
    private final RepositorioCliqueAd repositorioCliqueAd;
    private final MapperAd mapperAd;

    @Override
    @Transactional
    public RespostaAnunciante criarAnunciante(RequisicaoCriarAnunciante req) {
        if (req.emailContato() != null && !req.emailContato().isBlank() 
                && repositorioAnunciante.existsByEmailContato(req.emailContato())) {
            throw new ExcecaoNegocio("Já existe um anunciante cadastrado com este e-mail.");
        }

        Anunciante anunciante = Anunciante.builder()
                .nomeEmpresa(req.nomeEmpresa())
                .nomeContato(req.nomeContato())
                .emailContato(req.emailContato())
                .telefoneContato(req.telefoneContato())
                .ativo(true)
                .build();

        return mapperAd.paraResposta(repositorioAnunciante.save(anunciante));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaAnunciante> listarAnunciantes(Pageable pageable) {
        return repositorioAnunciante.findAll(pageable).map(mapperAd::paraResposta);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaAnunciante obterAnunciante(UUID id) {
        return repositorioAnunciante.findById(id)
                .map(mapperAd::paraResposta)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anunciante", "id", id));
    }

    @Override
    @Transactional
    public RespostaAnunciante ativarDesativarAnunciante(UUID id, boolean ativo) {
        Anunciante anunciante = repositorioAnunciante.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anunciante", "id", id));
        anunciante.setAtivo(ativo);
        return mapperAd.paraResposta(repositorioAnunciante.save(anunciante));
    }

    @Override
    @Transactional
    public RespostaCampanhaAd criarCampanha(RequisicaoCriarCampanha req) {
        Anunciante anunciante = repositorioAnunciante.findById(req.anuncianteId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anunciante", "id", req.anuncianteId()));

        if (!anunciante.isAtivo()) {
            throw new ExcecaoNegocio("Não é possível criar campanha para um anunciante inativo.", HttpStatus.BAD_REQUEST);
        }

        if (req.dataInicio().isAfter(req.dataFim())) {
            throw new ExcecaoNegocio("A data de início não pode ser posterior à data de fim.", HttpStatus.BAD_REQUEST);
        }

        CampanhaAd campanha = CampanhaAd.builder()
                .nome(req.nome())
                .anunciante(anunciante)
                .status(StatusCampanha.RASCUNHO)
                .dataInicio(req.dataInicio())
                .dataFim(req.dataFim())
                .orcamentoTotal(req.orcamentoTotal())
                .notasInternas(req.notasInternas())
                .build();

        return mapperAd.paraResposta(repositorioCampanhaAd.save(campanha));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaCampanhaAd> listarCampanhas(StatusCampanha filtroStatus, Pageable pageable) {
        if (filtroStatus != null) {
            return repositorioCampanhaAd.findByStatus(filtroStatus, pageable).map(mapperAd::paraResposta);
        }
        return repositorioCampanhaAd.findAll(pageable).map(mapperAd::paraResposta);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaCampanhaAd obterCampanha(UUID id) {
        return repositorioCampanhaAd.findById(id)
                .map(mapperAd::paraResposta)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Campanha", "id", id));
    }

    @Override
    @Transactional
    public RespostaCampanhaAd atualizarStatusCampanha(UUID id, StatusCampanha novoStatus) {
        CampanhaAd campanha = repositorioCampanhaAd.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Campanha", "id", id));
        campanha.setStatus(novoStatus);
        return mapperAd.paraResposta(repositorioCampanhaAd.save(campanha));
    }

    @Override
    @Transactional
    public RespostaCriativoAd criarCriativo(RequisicaoCriarCriativo req) {
        CampanhaAd campanha = repositorioCampanhaAd.findById(req.campanhaId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Campanha", "id", req.campanhaId()));

        CriativoAd criativo = CriativoAd.builder()
                .campanha(campanha)
                .tituloAlt(req.tituloAlt())
                .urlImagem(req.urlImagem())
                .urlDestino(req.urlDestino())
                .textoCta(req.textoCta())
                .placement(req.placement())
                .prioridade(req.prioridade())
                .ativo(true)
                .build();

        return mapperAd.paraResposta(repositorioCriativoAd.save(criativo));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RespostaCriativoAd> listarCriativosDaCampanha(UUID campanhaId) {
        if (!repositorioCampanhaAd.existsById(campanhaId)) {
            throw new ExcecaoRecursoNaoEncontrado("Campanha", "id", campanhaId);
        }
        return mapperAd.paraListaCriativos(repositorioCriativoAd.findByCampanhaId(campanhaId));
    }

    @Override
    @Transactional
    public RespostaCriativoAd ativarDesativarCriativo(UUID id, boolean ativo) {
        CriativoAd criativo = repositorioCriativoAd.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Criativo", "id", id));
        criativo.setAtivo(ativo);
        return mapperAd.paraResposta(repositorioCriativoAd.save(criativo));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RespostaAdServido> servirAnuncio(PlacementAd placement) {
        List<CriativoAd> ativos = repositorioCriativoAd.findActiveCreativesForPlacement(
                placement, LocalDate.now(), PageRequest.of(0, 1)
        );
        if (ativos.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(mapperAd.paraRespostaServido(ativos.get(0)));
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaMetricaAd obterMetricasCriativo(UUID criativoId) {
        CriativoAd criativo = repositorioCriativoAd.findById(criativoId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Criativo", "id", criativoId));

        long impressoes = repositorioImpressaoAd.countByCriativoId(criativoId);
        long cliques = repositorioCliqueAd.countByCriativoId(criativoId);
        double ctr = impressoes == 0 ? 0.0 : ((double) cliques / impressoes) * 100.0;

        return new RespostaMetricaAd(criativoId, criativo.getTituloAlt(), impressoes, cliques, ctr);
    }
}
