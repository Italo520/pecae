package com.pecae.api.anuncio.services;

import com.pecae.api.anuncio.dtos.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IServicoAnuncio {
    // Endpoints Públicos
    Page<RespostaAnuncio> listarPublicos(FiltrosAnuncioQuery filtros);
    RespostaDetalheAnuncio buscarDetalhe(UUID anuncioId, String ip);
    List<RespostaSugestaoAutocomplete> buscarSugestoes(String q);

    // Endpoints do Vendedor Autenticado
    RespostaDetalheAnuncio criar(UUID usuarioId, CriarAnuncioRequest request);
    RespostaDetalheAnuncio atualizar(UUID usuarioId, UUID anuncioId, AtualizarAnuncioRequest request);
    Page<RespostaAnuncio> listarMeusAnuncios(UUID usuarioId, Pageable pageable);
    void marcarComoVendido(UUID usuarioId, UUID anuncioId);
    void remover(UUID usuarioId, UUID anuncioId);
    void moderar(UUID anuncioId, com.pecae.api.anuncio.entities.enums.StatusAnuncio novoStatus);
    void pausar(UUID usuarioId, UUID anuncioId);
    void republicar(UUID usuarioId, UUID anuncioId);
    void encerrar(UUID usuarioId, UUID anuncioId);
}
