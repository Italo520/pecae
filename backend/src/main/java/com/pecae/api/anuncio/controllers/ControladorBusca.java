package com.pecae.api.anuncio.controllers;

import com.pecae.api.anuncio.dtos.RespostaSugestaoAutocomplete;
import com.pecae.api.anuncio.services.IServicoAnuncio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Busca", description = "Endpoints para auxílio de busca e autocomplete")
public class ControladorBusca {

    private final IServicoAnuncio servicoAnuncio;

    @GetMapping("/suggestions")
    @Operation(summary = "Obter sugestões de autocomplete", description = "Retorna uma lista de marcas e modelos baseados em uma string de busca.")
    public ResponseEntity<List<RespostaSugestaoAutocomplete>> buscarSugestoes(@RequestParam("q") String query) {
        List<RespostaSugestaoAutocomplete> sugestoes = servicoAnuncio.buscarSugestoes(query);
        return ResponseEntity.ok(sugestoes);
    }
}
