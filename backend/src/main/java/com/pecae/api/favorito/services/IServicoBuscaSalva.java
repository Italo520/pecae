package com.pecae.api.favorito.services;

import com.pecae.api.favorito.dtos.request.CriarBuscaSalvaRequest;
import com.pecae.api.favorito.dtos.response.RespostaBuscaSalva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IServicoBuscaSalva {

    RespostaBuscaSalva criarBuscaSalva(UUID usuarioId, CriarBuscaSalvaRequest request);

    void removerBuscaSalva(UUID id, UUID usuarioId);

    RespostaBuscaSalva alternarStatus(UUID id, UUID usuarioId, boolean ativa);

    Page<RespostaBuscaSalva> listarBuscasSalvas(UUID usuarioId, Pageable pageable);
}
