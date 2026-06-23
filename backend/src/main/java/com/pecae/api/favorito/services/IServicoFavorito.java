package com.pecae.api.favorito.services;

import com.pecae.api.favorito.dtos.response.RespostaFavorito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IServicoFavorito {

    void adicionarFavorito(UUID usuarioId, UUID anuncioId);

    void removerFavorito(UUID usuarioId, UUID anuncioId);

    Page<RespostaFavorito> listarFavoritos(UUID usuarioId, Pageable pageable);
}
