package com.pecae.api.notificacao.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.notificacao.dtos.request.RegistrarTokenPushRequest;
import com.pecae.api.notificacao.dtos.response.RespostaNotificacao;
import com.pecae.api.notificacao.services.IServicoNotificacao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controlador REST para gerenciar notificações e tokens de push.
 */
@RestController
@RequestMapping("/notificacoes")
@RequiredArgsConstructor
@Tag(name = "Notificações", description = "Endpoints para gerenciamento de notificações e tokens push")
public class ControladorNotificacao {

    private final IServicoNotificacao servicoNotificacao;

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar notificações", description = "Retorna uma lista paginada das notificações in-app do usuário logado.")
    public ResponseEntity<Page<RespostaNotificacao>> listar(
            @UsuarioAtual PrincipalUsuario principal,
            @PageableDefault(size = 20, sort = "criadaEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RespostaNotificacao> resposta = servicoNotificacao.listarNotificacoes(principal.getId(), pageable);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/tokens")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Registrar token push", description = "Associa um token de push notification do dispositivo ao usuário logado.")
    public ResponseEntity<Void> registrarToken(
            @UsuarioAtual PrincipalUsuario principal,
            @Valid @RequestBody RegistrarTokenPushRequest request
    ) {
        servicoNotificacao.registrarTokenPush(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/tokens/{token}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Remover token push", description = "Remove/Desvincula um token de push notification do sistema.")
    public ResponseEntity<Void> removerToken(@PathVariable String token) {
        servicoNotificacao.removerTokenPush(token);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/lida")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Marcar notificação como lida", description = "Define o status de leitura de uma notificação in-app como lida.")
    public ResponseEntity<Void> marcarComoLida(
            @UsuarioAtual PrincipalUsuario principal,
            @PathVariable UUID id
    ) {
        servicoNotificacao.marcarComoLida(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
