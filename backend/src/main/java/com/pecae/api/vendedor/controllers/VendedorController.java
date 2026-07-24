package com.pecae.api.vendedor.controllers;

import com.pecae.api.vendedor.dtos.CriarVendedorRequest;
import com.pecae.api.vendedor.dtos.RespostaPerfilVendedor;
import com.pecae.api.vendedor.dtos.AtualizarVendedorRequest;
import com.pecae.api.vendedor.services.VendedorService;
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

import java.util.UUID;

@RestController
@RequestMapping("/sellers")
@RequiredArgsConstructor
@Tag(name = "Sellers", description = "Endpoints para gerenciamento do perfil de vendedor")
public class VendedorController {

    private final VendedorService vendedorService;

    private void validarUsuario(PrincipalUsuario usuario) {
        if (usuario == null || usuario.getId() == null) {
            throw new org.springframework.security.access.AccessDeniedException("Usuário não autenticado ou token inválido.");
        }
    }

    @PostMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Criar perfil de vendedor", description = "Cria um perfil de vendedor para o usuário autenticado.")
    public ResponseEntity<RespostaPerfilVendedor> criarPerfil(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody CriarVendedorRequest request) {
        validarUsuario(usuario);
        RespostaPerfilVendedor resposta = vendedorService.criarPerfil(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Obter perfil de vendedor logado", description = "Retorna os detalhes do perfil de vendedor do usuário autenticado.")
    public ResponseEntity<RespostaPerfilVendedor> obterMeuPerfil(@UsuarioAtual PrincipalUsuario usuario) {
        validarUsuario(usuario);
        RespostaPerfilVendedor resposta = vendedorService.obterPerfilPorUsuarioId(usuario.getId());
        return ResponseEntity.ok(resposta);
    }

    @PatchMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Atualizar perfil de vendedor", description = "Atualiza os dados de perfil do vendedor autenticado.")
    public ResponseEntity<RespostaPerfilVendedor> atualizarPerfil(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody AtualizarVendedorRequest request) {
        validarUsuario(usuario);
        RespostaPerfilVendedor resposta = vendedorService.atualizarPerfil(usuario.getId(), request);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/{id}/public")
    @Operation(summary = "Obter perfil de vendedor por ID", description = "Retorna o perfil público de um vendedor através de seu ID único.")
    public ResponseEntity<RespostaPerfilVendedor> obterPerfilPorId(@PathVariable UUID id) {
        RespostaPerfilVendedor resposta = vendedorService.obterPerfilPorId(id);
        return ResponseEntity.ok(resposta);
    }

    @DeleteMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Excluir perfil de vendedor", description = "Inativa logicamente o perfil de vendedor do usuário autenticado.")
    public ResponseEntity<Void> excluirPerfil(@UsuarioAtual PrincipalUsuario usuario) {
        validarUsuario(usuario);
        vendedorService.excluirPerfil(usuario.getId());
        return ResponseEntity.noContent().build();
    }
}
