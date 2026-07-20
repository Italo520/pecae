package com.pecae.api.vendedor.controllers;

import com.pecae.api.vendedor.dtos.RespostaVerificacaoVendedor;
import com.pecae.api.vendedor.services.VendedorService;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sellers")
@RequiredArgsConstructor
@Tag(name = "Sellers Verification", description = "Endpoints para solicitação de verificação de conta de vendedor")
@SecurityRequirement(name = "bearerAuth")
public class VendedorVerificacaoController {

    private final VendedorService vendedorService;

    @PostMapping("/me/verification")
    @Operation(summary = "Solicitar verificação de conta", description = "Envia uma solicitação de auditoria/verificação para a conta do vendedor autenticado.")
    public ResponseEntity<RespostaVerificacaoVendedor> solicitarVerificacao(@UsuarioAtual PrincipalUsuario usuario) {
        RespostaVerificacaoVendedor resposta = vendedorService.solicitarVerificacao(usuario.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }
}
