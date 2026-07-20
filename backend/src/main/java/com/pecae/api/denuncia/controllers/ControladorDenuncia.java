package com.pecae.api.denuncia.controllers;

import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import com.pecae.api.denuncia.dtos.request.CriarDenunciaRequest;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.services.IServicoDenuncia;
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

@RestController
@RequestMapping("/denuncias")
@RequiredArgsConstructor
@Tag(name = "Denúncias", description = "Endpoints para criação e acompanhamento de denúncias")
public class ControladorDenuncia {

    private final IServicoDenuncia servicoDenuncia;

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Submeter uma nova denúncia", description = "Cria uma nova denúncia para um anúncio ou usuário.")
    public ResponseEntity<RespostaDenuncia> submeter(
        @UsuarioAtual PrincipalUsuario principal,
        @Valid @RequestBody CriarDenunciaRequest request
    ) {
        RespostaDenuncia resposta = servicoDenuncia.submeterDenuncia(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping("/minhas")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Listar minhas denúncias", description = "Retorna uma lista paginada das denúncias feitas pelo usuário logado.")
    public ResponseEntity<Page<RespostaDenuncia>> listarMinhas(
        @UsuarioAtual PrincipalUsuario principal,
        @PageableDefault(size = 20, sort = "criadaEm", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<RespostaDenuncia> resposta = servicoDenuncia.listarMinhasDenuncias(principal.getId(), pageable);
        return ResponseEntity.ok(resposta);
    }
}
