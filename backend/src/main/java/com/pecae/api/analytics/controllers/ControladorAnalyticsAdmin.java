package com.pecae.api.analytics.controllers;

import com.pecae.api.analytics.dtos.response.RespostaAnalyticsAdmin;
import com.pecae.api.analytics.services.IServicoAnalytics;
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
@RequestMapping("/analytics/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Analytics", description = "Endpoints de estatísticas globais para administradores")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class ControladorAnalyticsAdmin {

    private final IServicoAnalytics servicoAnalytics;

    @GetMapping("/dashboard")
    @Operation(summary = "Obter dashboard de métricas globais", description = "Retorna métricas consolidadas da plataforma para administradores.")
    public ResponseEntity<RespostaAnalyticsAdmin> obterDashboard(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        RespostaAnalyticsAdmin resposta = servicoAnalytics.obterMetricasGlobais(inicio, fim);
        return ResponseEntity.ok(resposta);
    }
}
