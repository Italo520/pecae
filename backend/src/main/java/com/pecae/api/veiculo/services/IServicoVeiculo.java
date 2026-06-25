package com.pecae.api.veiculo.services;

import com.pecae.api.veiculo.dtos.CriarVeiculoRequest;
import com.pecae.api.veiculo.dtos.AtualizarVeiculoRequest;
import com.pecae.api.veiculo.dtos.RespostaDetalheVeiculo;
import com.pecae.api.veiculo.dtos.RespostaVeiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IServicoVeiculo {
    RespostaDetalheVeiculo criar(UUID usuarioId, CriarVeiculoRequest request);
    RespostaDetalheVeiculo atualizar(UUID usuarioId, UUID veiculoId, AtualizarVeiculoRequest request);
    Page<RespostaVeiculo> listarMeusVeiculos(UUID usuarioId, Pageable pageable);
    RespostaDetalheVeiculo buscarDetalhes(UUID usuarioId, UUID veiculoId);
    RespostaDetalheVeiculo buscarDetalhesPublico(UUID veiculoId);
    void deletar(UUID usuarioId, UUID veiculoId);
}
