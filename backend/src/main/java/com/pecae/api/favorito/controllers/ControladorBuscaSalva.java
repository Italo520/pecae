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
@RequestMapping({"/buscas-salvas", "/buyers/saved-searches"})
@RequiredArgsConstructor
@Tag(name = "Buscas Salvas", description = "Endpoints para gerenciamento de buscas salvas e alertas")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class ControladorBuscaSalva {

    private final IServicoBuscaSalva servicoBuscaSalva;

    @PostMapping
    @Operation(summary = "Criar busca salva", description = "Salva critérios de busca para monitoramento e alertas.")
    public ResponseEntity<?> criar(
            @UsuarioAtual PrincipalUsuario principal,
            @RequestBody java.util.Map<String, Object> body,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        boolean isLegacy = request.getRequestURI().contains("/buyers/saved-searches");
        
        String query = (String) body.get("query");
        if (query == null) {
            query = (String) body.get("nome");
        }
        
        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> filters = (java.util.Map<String, Object>) body.get("filters");
        if (filters == null) {
            filters = (java.util.Map<String, Object>) body.get("filtros");
        }
        
        CriarBuscaSalvaRequest serviceRequest = new CriarBuscaSalvaRequest(
            query != null ? query : "Busca Salva",
            filters
        );
        
        RespostaBuscaSalva resposta = servicoBuscaSalva.criarBuscaSalva(principal.getId(), serviceRequest);
        
        if (isLegacy) {
            java.util.Map<String, Object> responseMap = new java.util.HashMap<>();
            responseMap.put("id", resposta.id());
            responseMap.put("userId", principal.getId());
            responseMap.put("query", resposta.nome());
            responseMap.put("filters", resposta.filtros());
            responseMap.put("alertActive", resposta.ativa());
            responseMap.put("createdAt", resposta.criadaEm());
            responseMap.put("updatedAt", resposta.criadaEm());
            return ResponseEntity.status(HttpStatus.CREATED).body(responseMap);
        }
        
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

    @PatchMapping("/{id}")
    @Operation(summary = "Alternar status da busca salva (Legado)", description = "Ativa ou desativa os alertas de uma busca salva via body JSON.")
    public ResponseEntity<?> alternarStatusLegado(
            @UsuarioAtual PrincipalUsuario principal,
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, Boolean> body
    ) {
        boolean alertActive = body.getOrDefault("alertActive", true);
        RespostaBuscaSalva resposta = servicoBuscaSalva.alternarStatus(id, principal.getId(), alertActive);
        
        java.util.Map<String, Object> responseMap = new java.util.HashMap<>();
        responseMap.put("id", resposta.id());
        responseMap.put("userId", principal.getId());
        responseMap.put("query", resposta.nome());
        responseMap.put("filters", resposta.filtros());
        responseMap.put("alertActive", resposta.ativa());
        responseMap.put("createdAt", resposta.criadaEm());
        responseMap.put("updatedAt", resposta.criadaEm());
        return ResponseEntity.ok(responseMap);
    }

    @GetMapping
    @Operation(summary = "Listar minhas buscas salvas", description = "Retorna uma lista paginada das buscas salvas pelo usuário.")
    public ResponseEntity<?> listar(
            @UsuarioAtual PrincipalUsuario principal,
            @PageableDefault(size = 20, sort = "criadaEm", direction = Sort.Direction.DESC) Pageable pageable,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        Page<RespostaBuscaSalva> buscas = servicoBuscaSalva.listarBuscasSalvas(principal.getId(), pageable);
        
        if (request.getRequestURI().contains("/buyers/saved-searches")) {
            java.util.List<java.util.Map<String, Object>> listaLegada = buscas.getContent().stream().map(b -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", b.id());
                map.put("userId", principal.getId());
                map.put("query", b.nome());
                map.put("filters", b.filtros());
                map.put("alertActive", b.ativa());
                map.put("createdAt", b.criadaEm());
                map.put("updatedAt", b.criadaEm());
                return map;
            }).toList();
            return ResponseEntity.ok(listaLegada);
        }
        
        return ResponseEntity.ok(buscas);
    }
}
