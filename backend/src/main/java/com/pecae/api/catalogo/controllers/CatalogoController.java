package com.pecae.api.catalogo.controllers;

import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.services.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/catalog")
@RequiredArgsConstructor
@Tag(name = "Catálogo Automotivo", description = "Endpoints públicos do catálogo de marcas, modelos, versões, anos e peças")
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/brands")
    @Operation(summary = "Obter todas as marcas ativas")
    public ResponseEntity<List<RespostaMarca>> obterTodasMarcas() {
        return ResponseEntity.ok(catalogoService.obterTodasMarcas());
    }

    @GetMapping("/brands/{brandId}/models")
    @Operation(summary = "Obter modelos ativos por ID da marca")
    public ResponseEntity<List<RespostaModelo>> obterModelosPorMarca(@PathVariable UUID brandId) {
        return ResponseEntity.ok(catalogoService.obterModelosPorMarca(brandId));
    }

    @GetMapping("/models/{modelId}/versions")
    @Operation(summary = "Obter versões ativas por ID do modelo")
    public ResponseEntity<List<RespostaVersao>> obterVersoesPorModelo(@PathVariable UUID modelId) {
        return ResponseEntity.ok(catalogoService.obterVersoesPorModelo(modelId));
    }

    @GetMapping("/versions/{versionId}/years")
    @Operation(summary = "Obter anos ativos por ID da versão")
    public ResponseEntity<List<RespostaAno>> obterAnosPorVersao(@PathVariable UUID versionId) {
        return ResponseEntity.ok(catalogoService.obterAnosPorVersao(versionId));
    }

    @GetMapping({"/categories", "/part-categories"})
    @Operation(summary = "Obter todas as categorias raiz ativas")
    public ResponseEntity<List<RespostaCategoriaPeca>> obterCategoriasRaiz() {
        return ResponseEntity.ok(catalogoService.obterCategoriasRaiz());
    }

    @GetMapping({"/categories/{categoryId}/sub", "/part-categories/{categoryId}/sub"})
    @Operation(summary = "Obter subcategorias ativas por ID da categoria pai")
    public ResponseEntity<List<RespostaCategoriaPeca>> obterSubcategorias(@PathVariable UUID categoryId) {
        return ResponseEntity.ok(catalogoService.obterSubcategorias(categoryId));
    }

    @GetMapping("/versions/{versionId}/parts")
    @Operation(summary = "Obter catálogo de peças ativas por ID da versão do veículo")
    public ResponseEntity<List<RespostaCatalogoPeca>> obterPecasPorVersao(@PathVariable UUID versionId) {
        return ResponseEntity.ok(catalogoService.obterPecasPorVersao(versionId));
    }
}
