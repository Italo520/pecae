package com.pecae.api.comprador.controllers;

import com.pecae.api.comprador.dtos.AtualizarCompradorRequest;
import com.pecae.api.comprador.dtos.ExcluirContaRequest;
import com.pecae.api.comprador.dtos.RespostaCompradorMe;
import com.pecae.api.comprador.services.CompradorService;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * Controller que expõe endpoints para gerenciamento de perfil e conta do comprador logado.
 */
@RestController
@RequestMapping("/buyers")
@RequiredArgsConstructor
@Tag(name = "Buyers", description = "Endpoints para gerenciamento do comprador autenticado")
@SecurityRequirement(name = "bearerAuth")
public class CompradorController {

    private final CompradorService compradorService;

    /**
     * Retorna os dados do perfil completo do comprador.
     */
    @GetMapping("/me")
    @Operation(summary = "Obter perfil do comprador logado", description = "Retorna os detalhes do comprador logado incluindo preferências de notificação.")
    public ResponseEntity<RespostaCompradorMe> obterMeuPerfil(@UsuarioAtual PrincipalUsuario usuario) {
        RespostaCompradorMe resposta = compradorService.obterPerfilPorUsuarioId(usuario.getId());
        return ResponseEntity.ok(resposta);
    }

    /**
     * Atualiza dados de perfil do comprador logado.
     */
    @PutMapping("/me")
    @Operation(summary = "Atualizar perfil do comprador logado", description = "Atualiza o nome, avatar e preferências de notificação do comprador.")
    public ResponseEntity<RespostaCompradorMe> atualizarMeuPerfil(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody AtualizarCompradorRequest request) {
        RespostaCompradorMe resposta = compradorService.atualizarPerfil(usuario.getId(), request);
        return ResponseEntity.ok(resposta);
    }

    /**
     * Exclui (inativa logicamente) a conta do comprador logado.
     */
    @DeleteMapping("/me")
    @Operation(summary = "Excluir conta do comprador logado", description = "Marca a conta do comprador como excluída logicamente após validação de senha.")
    public ResponseEntity<Void> excluirConta(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody ExcluirContaRequest request) {
        compradorService.excluirConta(usuario.getId(), request);
        return ResponseEntity.ok().build();
    }

    /**
     * Retorna a lista de negociações (chats) iniciadas pelo comprador (Stub para a Fase 9).
     */
    @GetMapping("/negotiations")
    @Operation(summary = "Obter negociações do comprador", description = "Retorna o histórico de chats e negociações iniciadas pelo comprador logado.")
    public ResponseEntity<List<Object>> obterNegociacoes(@UsuarioAtual PrincipalUsuario usuario) {
        // Retorna uma lista vazia por enquanto para compatibilidade com o app mobile (negociações dependem do chat da Fase 09)
        return ResponseEntity.ok(Collections.emptyList());
    }
}
