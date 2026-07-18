package com.pecae.api.anuncio.controllers;

import com.pecae.api.anuncio.dtos.*;
import com.pecae.api.anuncio.services.IServicoAnuncio;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("/listings")
@RequiredArgsConstructor
@Tag(name = "Anúncios", description = "Endpoints para gerenciamento de anúncios (listings) públicos e do vendedor")
@SecurityRequirement(name = "bearerAuth")
public class ControladorAnuncio {

    private final IServicoAnuncio servicoAnuncio;

    @GetMapping
    @Operation(summary = "Listar anúncios publicados", description = "Retorna uma lista paginada de anúncios ativos no catálogo público com base em filtros opcionais.")
    public ResponseEntity<Page<RespostaAnuncio>> listarPublicos(@Valid FiltrosAnuncioQuery filtros) {
        Page<RespostaAnuncio> resposta = servicoAnuncio.listarPublicos(filtros);
        return ResponseEntity.ok(resposta);
    }

    @GetMapping("/{anuncioId}")
    @Operation(summary = "Obter detalhes do anúncio", description = "Retorna os detalhes completos de um anúncio publicado e registra uma visualização assincronamente.")
    public ResponseEntity<RespostaDetalheAnuncio> buscarDetalhe(
            @PathVariable UUID anuncioId,
            HttpServletRequest request) {
        String ip = extrairIpReal(request);
        RespostaDetalheAnuncio resposta = servicoAnuncio.buscarDetalhe(anuncioId, ip);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/me")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Criar um novo anúncio", description = "Cria um anúncio para um veículo existente pertencente ao vendedor logado.")
    public ResponseEntity<RespostaDetalheAnuncio> criar(
            @UsuarioAtual PrincipalUsuario usuario,
            @Valid @RequestBody CriarAnuncioRequest request) {
        RespostaDetalheAnuncio resposta = servicoAnuncio.criar(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Listar meus anúncios", description = "Retorna uma lista paginada dos anúncios do vendedor autenticado.")
    public ResponseEntity<Page<RespostaAnuncio>> listarMeusAnuncios(
            @UsuarioAtual PrincipalUsuario usuario,
            Pageable pageable) {
        Page<RespostaAnuncio> resposta = servicoAnuncio.listarMeusAnuncios(usuario.getId(), pageable);
        return ResponseEntity.ok(resposta);
    }

    @PatchMapping("/me/{anuncioId}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Atualizar anúncio", description = "Atualiza parcialmente as informações do anúncio. Se estiver publicado, voltará a ficar pendente.")
    public ResponseEntity<RespostaDetalheAnuncio> atualizar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID anuncioId,
            @Valid @RequestBody AtualizarAnuncioRequest request) {
        RespostaDetalheAnuncio resposta = servicoAnuncio.atualizar(usuario.getId(), anuncioId, request);
        return ResponseEntity.ok(resposta);
    }

    @PatchMapping("/me/{anuncioId}/sold")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Marcar como vendido", description = "Marca o anúncio e o veículo correspondente como vendidos.")
    public ResponseEntity<Void> marcarComoVendido(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID anuncioId) {
        servicoAnuncio.marcarComoVendido(usuario.getId(), anuncioId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/{anuncioId}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Excluir anúncio", description = "Realiza a exclusão lógica (soft delete) do anúncio e altera o status para EXPIRADO.")
    public ResponseEntity<Void> deletar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID anuncioId) {
        servicoAnuncio.remover(usuario.getId(), anuncioId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/{anuncioId}/pause")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Pausar anúncio", description = "Altera o status do anúncio para PAUSADO e desativa temporariamente o veículo.")
    public ResponseEntity<Void> pausar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID anuncioId) {
        servicoAnuncio.pausar(usuario.getId(), anuncioId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/me/{anuncioId}/republish")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Republicar anúncio", description = "Altera o status do anúncio de volta para PENDENTE para re-entrar na fila de moderação.")
    public ResponseEntity<Void> republicar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID anuncioId) {
        servicoAnuncio.republicar(usuario.getId(), anuncioId);
        return ResponseEntity.noContent().build();
    }

    private String extrairIpReal(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
