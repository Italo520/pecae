package com.pecae.api.vendedor.controllers;

import com.pecae.api.vendedor.dtos.RespostaPerfilVendedor;
import com.pecae.api.vendedor.services.VendedorService;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/sellers")
@RequiredArgsConstructor
@Tag(name = "Sellers Media", description = "Endpoints (mockados) para upload de logo e banner de vendedores")
@SecurityRequirement(name = "bearerAuth")
public class VendedorMidiaController {

    private final VendedorService vendedorService;

    @PostMapping(value = "/me/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Fazer upload da logo do vendedor", description = "Mock de upload que gera uma URL fictícia e atualiza o perfil do vendedor.")
    public ResponseEntity<RespostaPerfilVendedor> fazerUploadLogo(
            @UsuarioAtual PrincipalUsuario usuario,
            @RequestParam("file") MultipartFile arquivo) {
        log.info("Simulando upload de logo para o usuário: {}, arquivo: {}", usuario.getId(), arquivo.getOriginalFilename());

        String urlLogoFicticia = "https://pecae-storage.s3.amazonaws.com/logos/logo-" + UUID.randomUUID() + ".png";
        RespostaPerfilVendedor resposta = vendedorService.atualizarLogo(usuario.getId(), urlLogoFicticia);

        return ResponseEntity.ok(resposta);
    }

    @PostMapping(value = "/me/banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Fazer upload do banner do vendedor", description = "Mock de upload que gera uma URL fictícia e atualiza o perfil do vendedor.")
    public ResponseEntity<RespostaPerfilVendedor> fazerUploadBanner(
            @UsuarioAtual PrincipalUsuario usuario,
            @RequestParam("file") MultipartFile arquivo) {
        log.info("Simulando upload de banner para o usuário: {}, arquivo: {}", usuario.getId(), arquivo.getOriginalFilename());

        String urlBannerFicticia = "https://pecae-storage.s3.amazonaws.com/banners/banner-" + UUID.randomUUID() + ".png";
        RespostaPerfilVendedor resposta = vendedorService.atualizarBanner(usuario.getId(), urlBannerFicticia);

        return ResponseEntity.ok(resposta);
    }
}
