package com.pecae.api.vendedor.services;

import com.pecae.api.vendedor.dtos.CriarVendedorRequest;
import com.pecae.api.vendedor.dtos.RespostaPerfilVendedor;
import com.pecae.api.vendedor.dtos.AtualizarVendedorRequest;
import com.pecae.api.vendedor.dtos.RespostaVerificacaoVendedor;

import java.util.UUID;

public interface VendedorService {
    RespostaPerfilVendedor criarPerfil(UUID usuarioId, CriarVendedorRequest request);
    RespostaPerfilVendedor atualizarPerfil(UUID usuarioId, AtualizarVendedorRequest request);
    RespostaPerfilVendedor obterPerfilPorUsuarioId(UUID usuarioId);
    RespostaPerfilVendedor obterPerfilPorId(UUID id);
    RespostaVerificacaoVendedor solicitarVerificacao(UUID usuarioId);
    RespostaPerfilVendedor atualizarLogo(UUID usuarioId, String urlLogo);
    RespostaPerfilVendedor atualizarBanner(UUID usuarioId, String urlBanner);
    void excluirPerfil(UUID usuarioId);
}
