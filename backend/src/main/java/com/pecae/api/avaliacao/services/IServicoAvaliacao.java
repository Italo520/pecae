package com.pecae.api.avaliacao.services;

import com.pecae.api.avaliacao.dtos.request.CriarAvaliacaoRequest;
import com.pecae.api.avaliacao.dtos.response.RespostaAvaliacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IServicoAvaliacao {
    RespostaAvaliacao submeterAvaliacao(UUID avaliadorId, CriarAvaliacaoRequest request);
    Page<RespostaAvaliacao> listarAvaliacoesDoVendedor(UUID vendedorId, Pageable pageable);
    void deletarAvaliacao(UUID avaliadorId, UUID avaliacaoId);
}
