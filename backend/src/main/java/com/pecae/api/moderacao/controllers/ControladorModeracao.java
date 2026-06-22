package com.pecae.api.moderacao.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.moderacao.dtos.request.DecisaoModeracaoRequest;
import com.pecae.api.moderacao.dtos.response.RespostaLogAuditoria;
import com.pecae.api.moderacao.services.IServicoModeracao;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/moderacao")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Moderação", description = "Endpoints de moderação para administradores e moderadores")
public class ControladorModeracao {

    private final IServicoModeracao servicoModeracao;

    @GetMapping("/denuncias/pendentes")
    @Operation(summary = "Listar denúncias pendentes", description = "Retorna uma lista paginada de todas as denúncias pendentes de moderação.")
    public ResponseEntity<Page<RespostaDenuncia>> listarDenunciasPendentes(
        @PageableDefault(size = 20, sort = "criadaEm", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<RespostaDenuncia> resposta = servicoModeracao.listarDenunciasPendentes(pageable);
        return ResponseEntity.ok(resposta);
    }

    @PostMapping("/denuncias/{id}/decisao")
    @Operation(summary = "Tomar decisão sobre uma denúncia", description = "Permite resolver ou descartar uma denúncia pendente.")
    public ResponseEntity<Void> processarDenuncia(
        @UsuarioAtual PrincipalUsuario principal,
        @PathVariable UUID id,
        @Valid @RequestBody DecisaoModeracaoRequest request
    ) {
        servicoModeracao.processarDenuncia(principal.getId(), id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/anuncios/{id}/decisao")
    @Operation(summary = "Tomar decisão sobre um anúncio", description = "Permite aprovar ou rejeitar um anúncio pendente.")
    public ResponseEntity<Void> moderarAnuncio(
        @UsuarioAtual PrincipalUsuario principal,
        @PathVariable UUID id,
        @Valid @RequestBody DecisaoModeracaoRequest request
    ) {
        servicoModeracao.moderarAnuncio(principal.getId(), id, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    @Operation(summary = "Listar logs de auditoria", description = "Retorna uma lista paginada de todas as ações de auditoria realizadas por moderadores.")
    public ResponseEntity<Page<RespostaLogAuditoria>> listarLogs(
        @PageableDefault(size = 20, sort = "criadoEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RespostaLogAuditoria> resposta = servicoModeracao.listarLogsAuditoria(pageable);
        return ResponseEntity.ok(resposta);
    }
}
