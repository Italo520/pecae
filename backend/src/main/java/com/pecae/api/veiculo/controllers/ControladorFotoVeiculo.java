package com.pecae.api.veiculo.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;
import com.pecae.api.veiculo.entities.enums.TipoFoto;
import com.pecae.api.veiculo.services.IServicoFotoVeiculo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vehicles/me/{veiculoId}/photos")
@RequiredArgsConstructor
@Tag(name = "Fotos do Veículo", description = "Endpoints para gerenciamento de fotos dos veículos do vendedor")
@SecurityRequirement(name = "bearerAuth")
public class ControladorFotoVeiculo {

    private final IServicoFotoVeiculo servicoFotoVeiculo;

    @GetMapping
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Listar fotos do veículo", description = "Retorna uma lista de todas as fotos associadas ao veículo informado.")
    public ResponseEntity<List<RespostaFotoVeiculo>> listar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId) {
        List<RespostaFotoVeiculo> resposta = servicoFotoVeiculo.listarFotos(usuario.getId(), veiculoId);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Adicionar foto ao veículo", description = "Faz upload e associa uma nova foto ao veículo informado.")
    public ResponseEntity<RespostaFotoVeiculo> adicionar(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId,
            @RequestParam("file") MultipartFile arquivo,
            @RequestParam(value = "type", required = false) TipoFoto tipo) {
        RespostaFotoVeiculo resposta = servicoFotoVeiculo.adicionarFoto(usuario.getId(), veiculoId, arquivo, tipo);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @DeleteMapping("/{fotoId}")
    @PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
    @Operation(summary = "Remover foto do veículo", description = "Remove uma foto associada ao veículo informado.")
    public ResponseEntity<Void> remover(
            @UsuarioAtual PrincipalUsuario usuario,
            @PathVariable UUID veiculoId,
            @PathVariable UUID fotoId) {
        servicoFotoVeiculo.removerFoto(usuario.getId(), veiculoId, fotoId);
        return ResponseEntity.noContent().build();
    }
}
