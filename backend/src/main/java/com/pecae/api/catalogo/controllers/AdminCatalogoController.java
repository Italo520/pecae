package com.pecae.api.catalogo.controllers;

import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.services.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/catalog")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Catálogo Automotivo", description = "Endpoints de gerenciamento do catálogo (restrito a ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class AdminCatalogoController {

    private final CatalogoService catalogoService;

    @PostMapping("/brands")
    @Operation(summary = "Criar nova marca no catálogo")
    public ResponseEntity<RespostaMarca> criarMarca(@Valid @RequestBody CriarMarcaRequest request) {
        RespostaMarca resposta = catalogoService.criarMarca(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PostMapping("/models")
    @Operation(summary = "Criar novo modelo no catálogo")
    public ResponseEntity<RespostaModelo> criarModelo(@Valid @RequestBody CriarModeloRequest request) {
        RespostaModelo resposta = catalogoService.criarModelo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PostMapping("/versions")
    @Operation(summary = "Criar nova versão no catálogo")
    public ResponseEntity<RespostaVersao> criarVersao(@Valid @RequestBody CriarVersaoRequest request) {
        RespostaVersao resposta = catalogoService.criarVersao(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @PostMapping("/categories")
    @Operation(summary = "Criar nova categoria de peça no catálogo")
    public ResponseEntity<RespostaCategoriaPeca> criarCategoriaPeca(@Valid @RequestBody CriarCategoriaPecaRequest request) {
        RespostaCategoriaPeca resposta = catalogoService.criarCategoriaPeca(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @DeleteMapping("/brands/{id}")
    @Operation(summary = "Desativar marca (inativação lógica)")
    public ResponseEntity<Void> desativarMarca(@PathVariable UUID id) {
        catalogoService.desativarMarca(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/models/{id}")
    @Operation(summary = "Desativar modelo (inativação lógica)")
    public ResponseEntity<Void> desativarModelo(@PathVariable UUID id) {
        catalogoService.desativarModelo(id);
        return ResponseEntity.noContent().build();
    }
}
