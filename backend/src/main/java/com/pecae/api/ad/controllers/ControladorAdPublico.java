package com.pecae.api.ad.controllers;

import com.pecae.api.ad.dtos.response.RespostaAdServido;
import com.pecae.api.ad.entities.enums.PlacementAd;
import com.pecae.api.ad.jobs.JobRastreamentoAd;
import com.pecae.api.ad.services.IServicoAd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller público (sem autenticação) para servir anúncios/banners aos usuários e registrar métricas (visualizações/cliques).
 */
@RestController
@RequestMapping("/ads")
@RequiredArgsConstructor
@Tag(name = "Ads Públicos", description = "Endpoints públicos para servir banners e rastrear visualizações e cliques de forma não autenticada")
public class ControladorAdPublico {

    private final IServicoAd servicoAd;
    private final JobRastreamentoAd jobRastreamento;

    @GetMapping("/serve/{placement}")
    @Operation(summary = "Servir banner publicitário", description = "Retorna o melhor banner ativo correspondente ao posicionamento desejado, ou 204 No Content se nenhum estiver ativo.")
    public ResponseEntity<RespostaAdServido> servirAnuncio(@PathVariable PlacementAd placement) {
        return servicoAd.servirAnuncio(placement)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{criativoId}/impression")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Registrar visualização (impressão) de anúncio", description = "Registra que um banner foi exibido ao usuário (não bloqueante / assíncrono).")
    public void registrarImpressao(
            @PathVariable UUID criativoId,
            HttpServletRequest request) {
        String ip = extrairIpReal(request);
        String userAgent = request.getHeader("User-Agent");
        jobRastreamento.registrarImpressao(criativoId, ip, userAgent);
    }

    @PostMapping("/{criativoId}/click")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Registrar clique em anúncio", description = "Registra que um banner foi clicado pelo usuário (não bloqueante / assíncrono).")
    public void registrarClique(
            @PathVariable UUID criativoId,
            HttpServletRequest request) {
        String ip = extrairIpReal(request);
        jobRastreamento.registrarClique(criativoId, ip);
    }

    private String extrairIpReal(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
