package com.pecae.api.veiculo.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.veiculo.dtos.CriarVeiculoRequest;
import com.pecae.api.veiculo.dtos.AtualizarVeiculoRequest;
import com.pecae.api.veiculo.dtos.RespostaDetalheVeiculo;
import com.pecae.api.veiculo.dtos.RespostaVeiculo;
import com.pecae.api.veiculo.services.IServicoVeiculo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Tag(name = "Veículos", description = "Endpoints para gerenciamento de veículos/sucatas pelo vendedor")
@SecurityRequirement(name = "bearerAuth")
public class ControladorVeiculo {

    private final IServicoVeiculo servicoVeiculo;

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Cadastrar um novo veículo", description = "Cadastra um veículo/sucata no catálogo do vendedor.")
    public ResponseEntity<RespostaDetalheVeiculo> criar(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody CriarVeiculoRequest request) {
        RespostaDetalheVeiculo resposta = servicoVeiculo.criar(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Listar meus veículos", description = "Retorna uma lista paginada dos veículos pertencentes ao vendedor autenticado.")
    public ResponseEntity<Page<RespostaVeiculo>> listarMe(
            @UsuarioAtual PrincipalUsuario usuario,
            Pageable pageable) {
        Page<RespostaVeiculo> resposta = servicoVeiculo.listarMeusVeiculos(usuario.getId(), pageable);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/{veiculoId}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Obter detalhes do veículo", description = "Retorna os detalhes completos de um veículo do vendedor autenticado.")
    public ResponseEntity<RespostaDetalheVeiculo> obterDetalhes(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId) {
        RespostaDetalheVeiculo resposta = servicoVeiculo.buscarDetalhes(usuario.getId(), veiculoId);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/public/{veiculoId}")
    @Operation(summary = "Obter detalhes públicos do veículo", description = "Retorna os detalhes completos de um veículo sem exigir autenticação.")
    public ResponseEntity<RespostaDetalheVeiculo> obterDetalhesPublico(
            @PathVariable UUID veiculoId) {
        RespostaDetalheVeiculo resposta = servicoVeiculo.buscarDetalhesPublico(veiculoId);
        return ResponseEntity.ok(resposta);
    }

    @PatchMapping("/{veiculoId}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Atualizar veículo", description = "Atualiza parcialmente os dados de um veículo do vendedor autenticado.")
    public ResponseEntity<RespostaDetalheVeiculo> atualizar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId,
            @Valid @RequestBody AtualizarVeiculoRequest request) {
        RespostaDetalheVeiculo resposta = servicoVeiculo.atualizar(usuario.getId(), veiculoId, request);
        return ResponseEntity.ok(resposta);
    }

    @DeleteMapping(value = {"/{veiculoId}", "/me/{veiculoId}"})
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Excluir veículo", description = "Realiza a exclusão lógica de um veículo do vendedor autenticado.")
    public ResponseEntity<Void> deletar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId) {
        servicoVeiculo.deletar(usuario.getId(), veiculoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = {"/{veiculoId}/duplicate", "/{veiculoId}/clone"})
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Duplicar veículo", description = "Clona os dados de um veículo para rascunho rápido.")
    public ResponseEntity<RespostaDetalheVeiculo> clonar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId) {
        RespostaDetalheVeiculo resposta = servicoVeiculo.clonar(usuario.getId(), veiculoId);
        return ResponseEntity.ok(resposta);
    }
}
