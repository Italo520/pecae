package com.pecae.api.usuario.controllers;

import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.usuario.dtos.TokenPushRequest;
import com.pecae.api.usuario.dtos.AtualizarUsuarioRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller que expõe endpoints para gerenciamento de perfil do usuário logado.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Endpoints para gerenciamento do perfil do usuário autenticado")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    /**
     * Retorna os dados do perfil do usuário atualmente autenticado.
     */
    @GetMapping("/me")
    @Operation(summary = "Obter perfil do usuário logado", description = "Retorna os detalhes de cadastro do usuário baseado no token JWT enviado.")
    public ResponseEntity<UsuarioResponse> obterMeuPerfil(@UsuarioAtual PrincipalUsuario usuario) {
        UsuarioResponse response = usuarioService.obterPerfilUsuario(usuario.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Atualiza dados cadastrais do perfil do usuário logado.
     */
    @PutMapping("/me")
    @Operation(summary = "Atualizar perfil do usuário logado", description = "Permite alterar o nome, telefone e avatar da conta do usuário autenticado.")
    public ResponseEntity<UsuarioResponse> atualizarMeuPerfil(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody AtualizarUsuarioRequest request) {
        UsuarioResponse response = usuarioService.atualizarUsuario(usuario.getId(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Registra ou atualiza o push token do dispositivo para envio de notificações pelo Expo.
     */
    @PostMapping("/push-token")
    @Operation(summary = "Registrar push token do Expo", description = "Associa o push token do Expo ao usuário autenticado para permitir envio de notificações.")
    public ResponseEntity<Void> registrarTokenPush(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody TokenPushRequest request) {
        usuarioService.salvarTokenPush(usuario.getId(), request.getToken(), request.getPlataforma());
        return ResponseEntity.ok().build();
    }
}
