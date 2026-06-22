package com.pecae.api.veiculo.services;

import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;
import com.pecae.api.veiculo.entities.enums.TipoFoto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface IServicoFotoVeiculo {
    List<RespostaFotoVeiculo> listarFotos(UUID usuarioId, UUID veiculoId);
    RespostaFotoVeiculo adicionarFoto(UUID usuarioId, UUID veiculoId, MultipartFile arquivo, TipoFoto tipo);
    void removerFoto(UUID usuarioId, UUID veiculoId, UUID fotoId);
}
