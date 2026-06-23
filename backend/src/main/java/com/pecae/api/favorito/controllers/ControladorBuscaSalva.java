package com.pecae.api.favorito.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.favorito.dtos.request.CriarBuscaSalvaRequest;
import com.pecae.api.favorito.dtos.response.RespostaBuscaSalva;
import com.pecae.api.favorito.services.IServicoBuscaSalva;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/buscas-salvas")
@RequiredArgsConstructor
@Tag(name = "Buscas Salvas", description = "Endpoints para gerenciamento de buscas salvas e alertas")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class ControladorBuscaSalva {

    private final IServicoBuscaSalva servicoBuscaSalva;

    @PostMapping
    @Operation(summary = "Criar busca salva", description = "Salva critérios de busca para monitoramento e alertas.")
    public ResponseEntity<RespostaBuscaSalva> criar(
            @UsuarioAtual PrincipalUsuario principal,
            @Valid @RequestBody CriarBuscaSalvaRequest request
    ) {
        RespostaBuscaSalva resposta = servicoBuscaSalva.criarBuscaSalva(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover busca salva", description = "Remove uma busca salva do usuário.")
    public ResponseEntity<Void> remover(
            @UsuarioAtual PrincipalUsuario principal,
            @PathVariable UUID id
    ) {
        servicoBuscaSalva.removerBuscaSalva(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Alternar status da busca salva", description = "Ativa ou desativa os alertas de uma busca salva.")
    public ResponseEntity<RespostaBuscaSalva> alternarStatus(
            @UsuarioAtual PrincipalUsuario principal,
            @PathVariable UUID id,
            @RequestParam boolean ativa
    ) {
        RespostaBuscaSalva resposta = servicoBuscaSalva.alternarStatus(id, principal.getId(), ativa);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping
    @Operation(summary = "Listar minhas buscas salvas", description = "Retorna uma lista paginada das buscas salvas pelo usuário.")
    public ResponseEntity<Page<RespostaBuscaSalva>> listar(
            @UsuarioAtual PrincipalUsuario principal,
            @PageableDefault(size = 20, sort = "criadaEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RespostaBuscaSalva> buscas = servicoBuscaSalva.listarBuscasSalvas(principal.getId(), pageable);
        return ResponseEntity.ok(buscas);
    }
}
