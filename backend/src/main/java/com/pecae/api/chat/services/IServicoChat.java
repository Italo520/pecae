package com.pecae.api.chat.services;

import com.pecae.api.chat.dtos.RequisicaoCriarSala;
import com.pecae.api.chat.dtos.RespostaCursorMensagens;
import com.pecae.api.chat.dtos.RespostaMensagemChat;
import com.pecae.api.chat.dtos.RespostaSalaChat;

import java.util.List;
import java.util.UUID;

public interface IServicoChat {

    RespostaSalaChat obterOuCriarSala(UUID compradorId, RequisicaoCriarSala requisicao);

    List<RespostaSalaChat> listarMinhasSalas(UUID usuarioId);

    RespostaSalaChat buscarSalaPorId(UUID salaId, UUID usuarioId);

    RespostaCursorMensagens buscarMensagens(UUID salaId, UUID usuarioId, String cursor);

    RespostaMensagemChat enviarMensagem(UUID salaId, UUID remetenteId, String conteudo);

    void marcarComoLido(UUID salaId, UUID usuarioId);

    String salvarAnexo(UUID salaId, UUID usuarioId, org.springframework.web.multipart.MultipartFile arquivo);
}
