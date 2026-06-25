package com.pecae.api.favorito.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.favorito.dtos.response.RespostaFavorito;
import com.pecae.api.favorito.services.IServicoFavorito;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/favoritos")
@RequiredArgsConstructor
@Tag(name = "Favoritos", description = "Endpoints para gerenciamento de anúncios favoritos")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class ControladorFavorito {

    private final IServicoFavorito servicoFavorito;

    @PostMapping("/{anuncioId}")
    @Operation(summary = "Adicionar anúncio aos favoritos", description = "Favorita um anúncio publicado.")
    public ResponseEntity<Void> adicionar(
            @UsuarioAtual PrincipalUsuario principal,
            @PathVariable UUID anuncioId
    ) {
        servicoFavorito.adicionarFavorito(principal.getId(), anuncioId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{anuncioId}")
    @Operation(summary = "Remover anúncio dos favoritos", description = "Remove um anúncio dos favoritos do usuário.")
    public ResponseEntity<Void> remover(
            @UsuarioAtual PrincipalUsuario principal,
            @PathVariable UUID anuncioId
    ) {
        servicoFavorito.removerFavorito(principal.getId(), anuncioId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Listar meus favoritos", description = "Retorna uma lista paginada dos anúncios favoritados pelo usuário.")
    public ResponseEntity<Page<RespostaFavorito>> listar(
            @UsuarioAtual PrincipalUsuario principal,
            @PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RespostaFavorito> favoritos = servicoFavorito.listarFavoritos(principal.getId(), pageable);
        return ResponseEntity.ok(favoritos);
    }
}
