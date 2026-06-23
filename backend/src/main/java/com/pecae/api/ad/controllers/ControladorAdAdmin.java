package com.pecae.api.ad.controllers;

import com.pecae.api.ad.dtos.request.RequisicaoCriarAnunciante;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCampanha;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCriativo;
import com.pecae.api.ad.dtos.response.*;
import com.pecae.api.ad.entities.enums.StatusCampanha;
import com.pecae.api.ad.services.IServicoAd;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/ads")
@RequiredArgsConstructor
@Tag(name = "Admin Ads", description = "Endpoints administrativos para gerenciamento do sistema de publicidade (anunciantes, campanhas e banners)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class ControladorAdAdmin {

    private final IServicoAd servicoAd;

    // ── ANUNCIANTES ──

    @PostMapping("/advertisers")
    @Operation(summary = "Criar novo anunciante", description = "Cadastra um patrocinador externo / empresa parceira no sistema.")
    public ResponseEntity<RespostaAnunciante> criarAnunciante(@Valid @RequestBody RequisicaoCriarAnunciante request) {
        RespostaAnunciante resposta = servicoAd.criarAnunciante(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/advertisers")
    @Operation(summary = "Listar anunciantes", description = "Lista todos os anunciantes cadastrados (paginado).")
    public ResponseEntity<Page<RespostaAnunciante>> listarAnunciantes(Pageable pageable) {
        return ResponseEntity.ok(servicoAd.listarAnunciantes(pageable));
    }

    @GetMapping("/advertisers/{id}")
    @Operation(summary = "Obter anunciante", description = "Recupera os detalhes de um anunciante específico por ID.")
    public ResponseEntity<RespostaAnunciante> obterAnunciante(@PathVariable UUID id) {
        return ResponseEntity.ok(servicoAd.obterAnunciante(id));
    }

    @PatchMapping("/advertisers/{id}/toggle")
    @Operation(summary = "Ativar/desativar anunciante", description = "Altera o status ativo de um anunciante.")
    public ResponseEntity<RespostaAnunciante> ativarDesativarAnunciante(
            @PathVariable UUID id,
            @RequestParam boolean ativo) {
        return ResponseEntity.ok(servicoAd.ativarDesativarAnunciante(id, ativo));
    }

    // ── CAMPANHAS ──

    @PostMapping("/campaigns")
    @Operation(summary = "Criar campanha de anúncios", description = "Cadastra uma nova campanha publicitária associada a um anunciante ativo.")
    public ResponseEntity<RespostaCampanhaAd> criarCampanha(@Valid @RequestBody RequisicaoCriarCampanha request) {
        RespostaCampanhaAd resposta = servicoAd.criarCampanha(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/campaigns")
    @Operation(summary = "Listar campanhas de anúncios", description = "Lista todas as campanhas, opcionalmente filtrando por status.")
    public ResponseEntity<Page<RespostaCampanhaAd>> listarCampanhas(
            @RequestParam(required = false) StatusCampanha status,
            Pageable pageable) {
        return ResponseEntity.ok(servicoAd.listarCampanhas(status, pageable));
    }

    @GetMapping("/campaigns/{id}")
    @Operation(summary = "Obter detalhes da campanha", description = "Recupera uma campanha específica pelo seu ID.")
    public ResponseEntity<RespostaCampanhaAd> obterCampanha(@PathVariable UUID id) {
        return ResponseEntity.ok(servicoAd.obterCampanha(id));
    }

    @PatchMapping("/campaigns/{id}/status")
    @Operation(summary = "Alterar status da campanha", description = "Altera o status de uma campanha (ex: ATIVA, PAUSADA, ENCERRADA).")
    public ResponseEntity<RespostaCampanhaAd> atualizarStatusCampanha(
            @PathVariable UUID id,
            @RequestParam StatusCampanha status) {
        return ResponseEntity.ok(servicoAd.atualizarStatusCampanha(id, status));
    }

    // ── CRIATIVOS (BANNERS) ──

    @PostMapping("/creatives")
    @Operation(summary = "Criar criativo (banner)", description = "Cria um novo banner vinculado a uma campanha e o associa a um placement.")
    public ResponseEntity<RespostaCriativoAd> criarCriativo(@Valid @RequestBody RequisicaoCriarCriativo request) {
        RespostaCriativoAd resposta = servicoAd.criarCriativo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/campaigns/{id}/creatives")
    @Operation(summary = "Listar criativos da campanha", description = "Retorna todos os criativos de uma campanha.")
    public ResponseEntity<List<RespostaCriativoAd>> listarCriativosDaCampanha(@PathVariable UUID id) {
        return ResponseEntity.ok(servicoAd.listarCriativosDaCampanha(id));
    }

    @PatchMapping("/creatives/{id}/toggle")
    @Operation(summary = "Ativar/desativar criativo", description = "Altera a disponibilidade de exibição de um criativo.")
    public ResponseEntity<RespostaCriativoAd> ativarDesativarCriativo(
            @PathVariable UUID id,
            @RequestParam boolean ativo) {
        return ResponseEntity.ok(servicoAd.ativarDesativarCriativo(id, ativo));
    }

    @GetMapping("/creatives/{id}/metrics")
    @Operation(summary = "Obter métricas do criativo", description = "Retorna o total de impressões, cliques e o CTR (%) de um banner.")
    public ResponseEntity<RespostaMetricaAd> obterMetricasCriativo(@PathVariable UUID id) {
        return ResponseEntity.ok(servicoAd.obterMetricasCriativo(id));
    }
}
