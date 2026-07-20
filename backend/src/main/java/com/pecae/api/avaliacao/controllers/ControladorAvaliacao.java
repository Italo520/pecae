package com.pecae.api.avaliacao.controllers;

import com.pecae.api.avaliacao.dtos.request.CriarAvaliacaoRequest;
import com.pecae.api.avaliacao.dtos.response.RespostaAvaliacao;
import com.pecae.api.avaliacao.services.IServicoAvaliacao;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/avaliacoes")
@RequiredArgsConstructor
@Tag(name = "Avaliações", description = "Endpoints para gerenciamento de avaliações de vendedores")
public class ControladorAvaliacao {

    private final IServicoAvaliacao servicoAvaliacao;

    @GetMapping("/vendedor/{vendedorId}")
    @Operation(summary = "Listar avaliações de um vendedor", description = "Retorna uma lista paginada de avaliações públicas de um determinado vendedor.")
    public ResponseEntity<Page<RespostaAvaliacao>> listarDoVendedor(
        @PathVariable UUID vendedorId,
        @PageableDefault(size = 20, sort = "criadaEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RespostaAvaliacao> resposta = servicoAvaliacao.listarAvaliacoesDoVendedor(vendedorId, pageable);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Submeter ou atualizar uma avaliação", description = "Submete uma nova avaliação ou atualiza uma existente para o vendedor especificado.")
    public ResponseEntity<RespostaAvaliacao> submeter(
        @UsuarioAtual PrincipalUsuario principal,
        @Valid @RequestBody CriarAvaliacaoRequest request
    ) {
        RespostaAvaliacao resposta = servicoAvaliacao.submeterAvaliacao(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @DeleteMapping("/{avaliacaoId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Deletar uma avaliação (soft delete)", description = "Deleta logicamente a avaliação informada. Apenas o próprio autor pode realizar a exclusão.")
    public ResponseEntity<Void> deletar(
        @UsuarioAtual PrincipalUsuario principal,
        @PathVariable UUID avaliacaoId
    ) {
        servicoAvaliacao.deletarAvaliacao(principal.getId(), avaliacaoId);
        return ResponseEntity.noContent().build();
    }
}
