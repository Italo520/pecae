package com.pecae.api.chat.controllers;

import com.pecae.api.chat.dtos.*;
import com.pecae.api.chat.services.IServicoChat;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Endpoints para gerenciamento de salas e mensagens de chat")
@SecurityRequirement(name = "bearerAuth")
public class ControladorChat {

    private final IServicoChat servicoChat;

    @PostMapping("/rooms")
    @Operation(summary = "Inicia ou recupera uma sala de chat", description = "Cria ou retorna uma sala de chat entre comprador e vendedor para um anúncio ou veículo específico.")
    public ResponseEntity<RespostaSalaChat> obterOuCriarSala(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody RequisicaoCriarSala requisicao
    ) {
        RespostaSalaChat resposta = servicoChat.obterOuCriarSala(usuario.getId(), requisicao);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/rooms")
    @Operation(summary = "Lista salas do usuário autenticado", description = "Retorna todas as salas de chat ativas do usuário logado (seja como comprador ou vendedor).")
    public ResponseEntity<List<RespostaSalaChat>> listarMinhasSalas(
            @UsuarioAtual PrincipalUsuario usuario
    ) {
        List<RespostaSalaChat> resposta = servicoChat.listarMinhasSalas(usuario.getId());
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/rooms/{id}")
    @Operation(summary = "Recupera detalhes de uma sala de chat", description = "Retorna informações detalhadas de uma sala de chat específica se o usuário for participante.")
    public ResponseEntity<RespostaSalaChat> buscarSala(
            @PathVariable UUID id,
            @UsuarioAtual PrincipalUsuario usuario
    ) {
        RespostaSalaChat resposta = servicoChat.buscarSalaPorId(id, usuario.getId());
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/rooms/{id}/messages")
    @Operation(summary = "Recupera histórico de mensagens com paginação por cursor", description = "Retorna as mensagens de uma sala de chat com paginação baseada em cursor.")
    public ResponseEntity<RespostaCursorMensagens> buscarMensagens(
            @PathVariable UUID id,
            @RequestParam(required = false) String cursor,
            @UsuarioAtual PrincipalUsuario usuario
    ) {
        RespostaCursorMensagens resposta = servicoChat.buscarMensagens(id, usuario.getId(), cursor);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/rooms/{id}/messages")
    @Operation(summary = "Envia uma nova mensagem via HTTP", description = "Envia uma mensagem no chat via REST HTTP. Usado como fallback ou em integrações.")
    public ResponseEntity<RespostaMensagemChat> enviarMensagem(
            @PathVariable UUID id,
            @Valid @RequestBody RequisicaoEnviarMensagem requisicao,
            @UsuarioAtual PrincipalUsuario usuario
    ) {
        RespostaMensagemChat resposta = servicoChat.enviarMensagem(id, usuario.getId(), requisicao.conteudo());
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PutMapping("/rooms/{id}/read")
    @Operation(summary = "Marca as mensagens da sala como lidas", description = "Atualiza o registro de última leitura do usuário logado na sala de chat especificada.")
    public ResponseEntity<Map<String, Boolean>> marcarComoLido(
            @PathVariable UUID id,
            @UsuarioAtual PrincipalUsuario usuario
    ) {
        servicoChat.marcarComoLido(id, usuario.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/rooms/{id}/attachment")
    @Operation(summary = "Fazer upload de anexo para a sala de chat", description = "Realiza o upload de uma imagem e retorna a URL pública.")
    public ResponseEntity<Map<String, String>> uploadAttachment(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @UsuarioAtual PrincipalUsuario usuario
    ) {
        String url = servicoChat.salvarAnexo(id, usuario.getId(), file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
