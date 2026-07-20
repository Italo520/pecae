package com.pecae.api.moderacao.controllers;

import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.vendedor.repositories.VerificacaoVendedorRepository;
import com.pecae.api.denuncia.repositories.RepositorioDenuncia;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping({"/admin", "/moderation"})
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MODERADOR')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Compatibilidade", description = "Endpoints de compatibilidade administrativa para o dashboard do moderador")
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ControladorAdminCompatibilidade {

    private final UsuarioRepository usuarioRepository;
    private final RepositorioAnuncio repositorioAnuncio;
    private final VerificacaoVendedorRepository verificacaoVendedorRepository;
    private final RepositorioDenuncia repositorioDenuncia;
    private final com.pecae.api.ad.repositories.RepositorioCampanhaAd repositorioCampanhaAd;
    private final com.pecae.api.ad.repositories.RepositorioCliqueAd repositorioCliqueAd;
    private final com.pecae.api.ad.services.IServicoAd servicoAd;

    @GetMapping("/campaigns")
    @Operation(summary = "Listar todas as campanhas em formato simplificado compatível com o frontend")
    public ResponseEntity<List<Map<String, Object>>> getCampaigns() {
        List<Map<String, Object>> response = repositorioCampanhaAd.findAll().stream()
            .map(c -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getNome());
                map.put("status", c.getStatus().name());
                
                long clicksCount = 0;
                if (c.getCriativos() != null) {
                    for (var cr : c.getCriativos()) {
                        clicksCount += repositorioCliqueAd.countByCriativoId(cr.getId());
                    }
                }
                map.put("clicks", clicksCount);
                map.put("budget", c.getOrcamentoTotal() != null ? c.getOrcamentoTotal() : java.math.BigDecimal.ZERO);
                return map;
            })
            .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/campaigns/stats")
    @Operation(summary = "Obter estatísticas de campanhas")
    public ResponseEntity<Map<String, Object>> getCampaignsStats() {
        List<com.pecae.api.ad.entities.CampanhaAd> allCampaigns = repositorioCampanhaAd.findAll();
        long active = allCampaigns.stream().filter(c -> c.getStatus() == com.pecae.api.ad.entities.enums.StatusCampanha.ATIVA).count();
        
        long totalClicks = 0;
        double totalRevenue = 0.0;
        
        for (var c : allCampaigns) {
            if (c.getCriativos() != null) {
                for (var cr : c.getCriativos()) {
                    totalClicks += repositorioCliqueAd.countByCriativoId(cr.getId());
                }
            }
            if (c.getStatus() == com.pecae.api.ad.entities.enums.StatusCampanha.ATIVA && c.getOrcamentoTotal() != null) {
                totalRevenue += c.getOrcamentoTotal().doubleValue();
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("active", active);
        response.put("clicks", totalClicks);
        response.put("revenue", totalRevenue);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/campaigns/{id}")
    @Operation(summary = "Atualizar status da campanha de anúncios")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> updateCampaignStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");
        com.pecae.api.ad.entities.enums.StatusCampanha status = com.pecae.api.ad.entities.enums.StatusCampanha.valueOf(statusStr);
        
        var updated = servicoAd.atualizarStatusCampanha(id, status);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", updated.id());
        response.put("status", updated.status().name());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    @Operation(summary = "Obter estatísticas administrativas")
    public ResponseEntity<Map<String, Object>> getStats() {
        long activeUsers = usuarioRepository.count();
        long activeListings = repositorioAnuncio.countByStatus(com.pecae.api.anuncio.entities.enums.StatusAnuncio.PUBLICADO);
        long pendingDocs = verificacaoVendedorRepository.findAll().stream()
                .filter(v -> v.getStatus() == com.pecae.api.vendedor.entities.enums.StatusVerificacao.PENDENTE)
                .count();
        long openReports = repositorioDenuncia.findAll().stream()
                .filter(d -> d.getStatus() == com.pecae.api.denuncia.entities.enums.StatusDenuncia.PENDENTE)
                .count();

        Map<String, Object> response = new HashMap<>();
        response.put("activeUsers", activeUsers);
        response.put("activeListings", activeListings);
        response.put("pendingDocs", pendingDocs);
        response.put("openReports", openReports);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/kyc/pending")
    @Operation(summary = "Listar documentos KYC pendentes")
    public ResponseEntity<List<Map<String, Object>>> getPendingKyc(@RequestParam(defaultValue = "5") int limit) {
        List<Map<String, Object>> response = verificacaoVendedorRepository.findAll().stream()
                .filter(v -> v.getStatus() == com.pecae.api.vendedor.entities.enums.StatusVerificacao.PENDENTE)
                .limit(limit)
                .map(v -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", v.getId());
                    map.put("documentType", "CNPJ / Contrato Social");

                    Map<String, Object> userMap = new HashMap<>();
                    if (v.getPerfilVendedor() != null && v.getPerfilVendedor().getUsuario() != null) {
                        userMap.put("name", v.getPerfilVendedor().getUsuario().getNome());
                    } else {
                        userMap.put("name", "Vendedor");
                    }
                    map.put("user", userMap);
                    return map;
                })
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/kyc/{id}/approve")
    @Operation(summary = "Aprovar documento KYC")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> approveKyc(@PathVariable UUID id) {
        var verification = verificacaoVendedorRepository.findById(id)
                .orElseThrow(() -> new com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado("Verificação não encontrada"));
        verification.setStatus(com.pecae.api.vendedor.entities.enums.StatusVerificacao.APROVADO);
        verification.setResolvidoEm(java.time.LocalDateTime.now());
        verificacaoVendedorRepository.save(verification);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", verification.getId());
        response.put("status", "APPROVED");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/kyc/{id}/reject")
    @Operation(summary = "Rejeitar documento KYC")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> rejectKyc(@PathVariable UUID id, @RequestBody(required = false) Map<String, String> body) {
        var verification = verificacaoVendedorRepository.findById(id)
                .orElseThrow(() -> new com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado("Verificação não encontrada"));
        verification.setStatus(com.pecae.api.vendedor.entities.enums.StatusVerificacao.REJEITADO);
        verification.setResolvidoEm(java.time.LocalDateTime.now());
        if (body != null && body.containsKey("reason")) {
            verification.setMotivoRejeicao(body.get("reason"));
        }
        verificacaoVendedorRepository.save(verification);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", verification.getId());
        response.put("status", "REJECTED");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reports")
    @Operation(summary = "Listar denúncias recentes")
    public ResponseEntity<List<Map<String, Object>>> getRecentReports(@RequestParam(defaultValue = "5") int limit) {
        List<Map<String, Object>> response = repositorioDenuncia.findAll().stream()
                .filter(d -> d.getStatus() == com.pecae.api.denuncia.entities.enums.StatusDenuncia.PENDENTE)
                .limit(limit)
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("reason", d.getCategoria() != null ? d.getCategoria().name() : "Denúncia Padrão");
                    map.put("description", d.getDescricao() != null ? d.getDescricao() : "Sem descrição detalhada fornecida pelo usuário.");
                    map.put("severity", "MEDIA");
                    map.put("createdAt", d.getCriadaEm() != null ? d.getCriadaEm().toString() : java.time.LocalDateTime.now().toString());
                    
                    Map<String, Object> reporterMap = new HashMap<>();
                    reporterMap.put("name", d.getDenunciante() != null ? d.getDenunciante().getNome() : "Usuário Anônimo");
                    map.put("reporter", reporterMap);
                    
                    Map<String, Object> targetMap = new HashMap<>();
                    targetMap.put("name", "Alvo Oculto");
                    map.put("reportedEntity", targetMap);
                    
                    return map;
                })
                .toList();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reports/{id}/resolve")
    @Operation(summary = "Resolver denúncia")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> resolveReport(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        String action = body.get("action");
        var report = repositorioDenuncia.findById(id)
                .orElseThrow(() -> new com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado("Denúncia não encontrada"));
        
        if ("DISMISS".equalsIgnoreCase(action)) {
            report.setStatus(com.pecae.api.denuncia.entities.enums.StatusDenuncia.DESCARTADA);
        } else {
            report.setStatus(com.pecae.api.denuncia.entities.enums.StatusDenuncia.RESOLVIDA);
        }
        
        repositorioDenuncia.save(report);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", report.getId());
        response.put("status", report.getStatus().name());
        return ResponseEntity.ok(response);
    }
}
