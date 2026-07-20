package com.pecae.api.moderacao.services;

import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.moderacao.dtos.request.DecisaoModeracaoRequest;
import com.pecae.api.moderacao.dtos.response.RespostaLogAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IServicoModeracao {
    Page<RespostaDenuncia> listarDenunciasPendentes(Pageable pageable);
    Page<com.pecae.api.anuncio.dtos.RespostaAnuncio> listarAnunciosPendentes(Pageable pageable);
    void processarDenuncia(UUID moderadorId, UUID denunciaId, DecisaoModeracaoRequest request);
    void moderarAnuncio(UUID moderadorId, UUID anuncioId, DecisaoModeracaoRequest request);
    Page<RespostaLogAuditoria> listarLogsAuditoria(Pageable pageable);
}
