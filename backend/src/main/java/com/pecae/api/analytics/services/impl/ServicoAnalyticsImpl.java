package com.pecae.api.analytics.services.impl;

import com.pecae.api.analytics.dtos.response.RespostaAnalyticsAdmin;
import com.pecae.api.analytics.dtos.response.RespostaAnalyticsVendedor;
import com.pecae.api.analytics.dtos.response.RespostaMetricaAdminDiaria;
import com.pecae.api.analytics.dtos.response.RespostaMetricaVendedorDiaria;
import com.pecae.api.analytics.entities.MetricaAdmin;
import com.pecae.api.analytics.entities.MetricaVendedor;
import com.pecae.api.analytics.mappers.MapperAnalytics;
import com.pecae.api.analytics.repositories.RepositorioMetricaAdmin;
import com.pecae.api.analytics.repositories.RepositorioMetricaVendedor;
import com.pecae.api.analytics.services.IServicoAnalytics;
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioVisualizacaoAnuncio;
import com.pecae.api.chat.repositories.RepositorioSalaChat;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServicoAnalyticsImpl implements IServicoAnalytics {

    private final RepositorioMetricaAdmin repositorioMetricaAdmin;
    private final RepositorioMetricaVendedor repositorioMetricaVendedor;
    private final PerfilVendedorRepository perfilVendedorRepository;
    private final RepositorioAnuncio repositorioAnuncio;
    private final RepositorioVisualizacaoAnuncio repositorioVisualizacaoAnuncio;
    private final RepositorioSalaChat repositorioSalaChat;
    private final UsuarioRepository usuarioRepository;
    private final MapperAnalytics mapperAnalytics;

    @Override
    @Transactional(readOnly = true)
    public RespostaAnalyticsVendedor obterMetricasVendedor(UUID vendedorId, LocalDate inicio, LocalDate fim) {
        List<MetricaVendedor> metricas = repositorioMetricaVendedor
            .findByVendedorIdAndDataReferenciaBetweenOrderByDataReferenciaAsc(vendedorId, inicio, fim);

        int totalViews = metricas.stream().mapToInt(MetricaVendedor::getVisualizacoes).sum();
        int totalContacts = metricas.stream().mapToInt(MetricaVendedor::getContatos).sum();
        double conversionRate = totalViews > 0 ? ((double) totalContacts / totalViews) * 100.0 : 0.0;

        List<RespostaMetricaVendedorDiaria> historico = metricas.stream()
            .map(mapperAnalytics::paraRespostaDiaria)
            .collect(Collectors.toList());

        return new RespostaAnalyticsVendedor(totalViews, totalContacts, conversionRate, historico);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaAnalyticsAdmin obterMetricasGlobais(LocalDate inicio, LocalDate fim) {
        List<MetricaAdmin> metricas = repositorioMetricaAdmin
            .findByDataReferenciaBetweenOrderByDataReferenciaAsc(inicio, fim);

        int totalAnunciosAtivos = (int) repositorioAnuncio.countByStatus(StatusAnuncio.PUBLICADO);
        
        LocalDateTime agora = LocalDateTime.now();
        int totalUsuariosAtivos = (int) usuarioRepository.countByUltimoAcessoEmBetween(agora.minusDays(1), agora);

        BigDecimal receitaTotalAcumulada = metricas.stream()
            .map(MetricaAdmin::getReceitaTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<RespostaMetricaAdminDiaria> historico = metricas.stream()
            .map(mapperAnalytics::paraRespostaDiaria)
            .collect(Collectors.toList());

        return new RespostaAnalyticsAdmin(totalAnunciosAtivos, totalUsuariosAtivos, receitaTotalAcumulada, historico);
    }

    @Override
    @Transactional
    public void realizarAgregacaoDiaria() {
        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioDia = hoje.atStartOfDay();
        LocalDateTime fimDia = hoje.atTime(LocalTime.MAX);

        // 1. Agregação Admin
        int activeUsers = (int) usuarioRepository.countByUltimoAcessoEmBetween(inicioDia, fimDia);
        int createdListings = (int) repositorioAnuncio.countByCriadoEmBetween(inicioDia, fimDia);
        BigDecimal dailyRevenue = BigDecimal.ZERO; // Monetização ainda não implementada

        MetricaAdmin metricaAdmin = repositorioMetricaAdmin.findByDataReferencia(hoje)
            .orElseGet(() -> MetricaAdmin.builder().dataReferencia(hoje).build());

        metricaAdmin.setActiveUsers(activeUsers);
        metricaAdmin.setTotalAnuncios(createdListings);
        metricaAdmin.setReceitaTotal(dailyRevenue);

        repositorioMetricaAdmin.save(metricaAdmin);

        // 2. Agregação por Vendedor
        List<PerfilVendedor> perfis = perfilVendedorRepository.findAll();
        for (PerfilVendedor perfil : perfis) {
            if (perfil.getUsuario() == null) continue;

            UUID userId = perfil.getUsuario().getId();

            int views = (int) repositorioVisualizacaoAnuncio
                .countByAnuncioPerfilVendedorIdAndVistoBetween(perfil.getId(), inicioDia, fimDia);

            int contacts = (int) repositorioSalaChat
                .countByVendedorIdAndCriadaEmBetween(userId, inicioDia, fimDia);

            double conversionRate = views > 0 ? ((double) contacts / views) * 100.0 : 0.0;

            MetricaVendedor metricaVendedor = repositorioMetricaVendedor
                .findByVendedorIdAndDataReferencia(userId, hoje)
                .orElseGet(() -> MetricaVendedor.builder()
                    .vendedor(perfil.getUsuario())
                    .dataReferencia(hoje)
                    .build());

            metricaVendedor.setVisualizacoes(views);
            metricaVendedor.setContatos(contacts);
            metricaVendedor.setTaxaConversao(conversionRate);

            repositorioMetricaVendedor.save(metricaVendedor);
        }
    }
}
