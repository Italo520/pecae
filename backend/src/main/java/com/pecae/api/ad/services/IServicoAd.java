package com.pecae.api.ad.services;

import com.pecae.api.ad.dtos.request.RequisicaoCriarAnunciante;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCampanha;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCriativo;
import com.pecae.api.ad.dtos.response.*;
import com.pecae.api.ad.entities.enums.PlacementAd;
import com.pecae.api.ad.entities.enums.StatusCampanha;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Interface que define os serviços e regras de negócio para o módulo de publicidade (ads).
 */
public interface IServicoAd {

    // Anunciantes
    RespostaAnunciante criarAnunciante(RequisicaoCriarAnunciante req);
    Page<RespostaAnunciante> listarAnunciantes(Pageable pageable);
    RespostaAnunciante obterAnunciante(UUID id);
    RespostaAnunciante ativarDesativarAnunciante(UUID id, boolean ativo);

    // Campanhas
    RespostaCampanhaAd criarCampanha(RequisicaoCriarCampanha req);
    Page<RespostaCampanhaAd> listarCampanhas(StatusCampanha filtroStatus, Pageable pageable);
    RespostaCampanhaAd obterCampanha(UUID id);
    RespostaCampanhaAd atualizarStatusCampanha(UUID id, StatusCampanha novoStatus);

    // Criativos
    RespostaCriativoAd criarCriativo(RequisicaoCriarCriativo req);
    List<RespostaCriativoAd> listarCriativosDaCampanha(UUID campanhaId);
    RespostaCriativoAd ativarDesativarCriativo(UUID id, boolean ativo);

    // Exibição e métricas
    Optional<RespostaAdServido> servirAnuncio(PlacementAd placement);
    RespostaMetricaAd obterMetricasCriativo(UUID criativoId);
}
