package com.pecae.api.moderacao.services;

import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import com.pecae.api.usuario.entities.Usuario;

import java.util.UUID;

public interface IServicoAuditoria {
    void registrarAcao(Usuario moderador, AcaoModeracao acao, String tipoEntidade, UUID idEntidade, String motivo);
}
