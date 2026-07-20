package com.pecae.api.analytics.controllers;

import com.pecae.api.analytics.dtos.response.RespostaAnalyticsVendedor;
import com.pecae.api.analytics.services.IServicoAnalytics;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.UsuarioAtual;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/sellers/me")
@RequiredArgsConstructor
@Tag(name = "Vendedor Analytics", description = "Endpoints de estatísticas e métricas para o vendedor")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('VENDEDOR', 'AMBOS')")
public class ControladorAnalyticsVendedor {

    private final IServicoAnalytics servicoAnalytics;

    @GetMapping("/stats")
    @Operation(summary = "Obter dashboard de métricas do vendedor", description = "Retorna métricas consolidadas e histórico de visualizações/contatos do vendedor.")
    public ResponseEntity<RespostaAnalyticsVendedor> obterDashboard(
            @UsuarioAtual PrincipalUsuario usuario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        RespostaAnalyticsVendedor resposta = servicoAnalytics.obterMetricasVendedor(usuario.getId(), inicio, fim);
        return ResponseEntity.ok(resposta);
    }
}
