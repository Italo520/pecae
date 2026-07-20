package com.pecae.api.autenticacao.controllers;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.autenticacao.dtos.*;
import com.pecae.api.autenticacao.services.AutenticacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller que expõe as rotas públicas de autenticação, registro e recuperação de conta.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "auth", description = "Endpoints públicos de autenticação e registro")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    /**
     * Registra um novo usuário no sistema.
     */
    @PostMapping("/register")
    @Operation(summary = "Registrar um novo usuário", description = "Cria uma conta com e-mail/senha. O e-mail precisará ser verificado antes do login.")
    @ApiResponse(responseCode = "201", description = "Usuário registrado com sucesso")
    @ApiResponse(responseCode = "409", description = "E-mail já está em uso")
    public ResponseEntity<RespostaAutenticacao> registrar(
            @Valid @RequestBody RegistroRequest request,
            HttpServletRequest httpServletRequest,
            @RequestHeader(value = "User-Agent", defaultValue = "unknown") String userAgent) {

        String ip = httpServletRequest.getRemoteAddr();
        RespostaAutenticacao resposta = autenticacaoService.registrar(request, ip, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    /**
     * Realiza login convencional de usuário.
     */
    @PostMapping("/login")
    @Operation(summary = "Realizar login por e-mail e senha", description = "Autentica o usuário e retorna o token de acesso (JWT) e o refresh token.")
    @ApiResponse(responseCode = "200", description = "Login efetuado com sucesso")
    @ApiResponse(responseCode = "401", description = "Credenciais inválidas ou e-mail não verificado")
    public ResponseEntity<RespostaAutenticacao> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest,
            @RequestHeader(value = "User-Agent", defaultValue = "unknown") String userAgent) {

        String ip = httpServletRequest.getRemoteAddr();
        RespostaAutenticacao resposta = autenticacaoService.login(request, ip, userAgent);
        return ResponseEntity.ok(resposta);
    }

    /**
     * Valida o e-mail do usuário pelo código recebido.
     */
    @PostMapping("/verify-email")
    @Operation(summary = "Verificar e-mail do usuário", description = "Ativa a conta do usuário a partir do código de 6 dígitos enviado por e-mail.")
    public ResponseEntity<RespostaMensagem> verificarEmail(@Valid @RequestBody VerificarEmailRequest request) {
        autenticacaoService.verificarEmail(request.getCodigo());
        return ResponseEntity.ok(new RespostaMensagem("E-mail verificado com sucesso! Sua conta está ativa."));
    }

    /**
     * Renova o token de acesso utilizando um refresh token válido.
     */
    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token", description = "Recebe o refresh token ativo e retorna um novo access token.")
    public ResponseEntity<RespostaToken> renovar(
            @RequestBody Map<String, String> body,
            HttpServletRequest httpServletRequest,
            @RequestHeader(value = "User-Agent", defaultValue = "unknown") String userAgent) {

        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().build();
        }

        String ip = httpServletRequest.getRemoteAddr();
        RespostaToken resposta = autenticacaoService.renovarTokens(refreshToken, ip, userAgent);
        return ResponseEntity.ok(resposta);
    }

    /**
     * Encerra a sessão ativa e revoga o refresh token.
     */
    @PostMapping("/logout")
    @Operation(summary = "Encerrar sessão (Logout)", description = "Revoga o refresh token informado impedindo novas renovações de token.")
    public ResponseEntity<RespostaMensagem> logout(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken != null) {
            autenticacaoService.logout(refreshToken);
        }
        return ResponseEntity.ok(new RespostaMensagem("Sessão encerrada com sucesso."));
    }

    /**
     * Solicita o código/token de recuperação de senha por e-mail.
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar link de recuperação de senha", description = "Gera um token temporário de redefinição se o e-mail existir no sistema.")
    public ResponseEntity<RespostaMensagem> recuperarSenha(@Valid @RequestBody EsqueceuSenhaRequest request) {
        autenticacaoService.recuperarSenha(request.getEmail());
        return ResponseEntity.ok(new RespostaMensagem("Instruções de recuperação enviadas para o e-mail informado."));
    }

    /**
     * Redefine a senha de acesso usando o token enviado.
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Redefinir senha usando token", description = "Substitui a senha de acesso da conta utilizando o token de redefinição ativo.")
    public ResponseEntity<RespostaMensagem> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequest request) {
        autenticacaoService.redefinirSenha(request.getToken(), request.getNovaSenha());
        return ResponseEntity.ok(new RespostaMensagem("Senha redefinida com sucesso. Faça login novamente."));
    }

    /**
     * Resposta simples de mensagem textual.
     */
    @Getter
    @AllArgsConstructor
    public static class RespostaMensagem {
        @JsonProperty("message")
        private String mensagem;
    }
}
