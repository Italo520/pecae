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
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioVisualizacaoAnuncio;
import com.pecae.api.chat.repositories.RepositorioSalaChat;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoAnalyticsImpl")
class ServicoAnalyticsImplTest {

    @Mock
    private RepositorioMetricaAdmin repositorioMetricaAdmin;

    @Mock
    private RepositorioMetricaVendedor repositorioMetricaVendedor;

    @Mock
    private PerfilVendedorRepository perfilVendedorRepository;

    @Mock
    private RepositorioAnuncio repositorioAnuncio;

    @Mock
    private RepositorioVisualizacaoAnuncio repositorioVisualizacaoAnuncio;

    @Mock
    private RepositorioSalaChat repositorioSalaChat;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MapperAnalytics mapperAnalytics;

    @InjectMocks
    private ServicoAnalyticsImpl servicoAnalytics;

    @Test
    @DisplayName("Deve obter métricas do vendedor com sucesso")
    void deveObterMetricasVendedorComSucesso() {
        UUID vendedorId = UUID.randomUUID();
        LocalDate inicio = LocalDate.now().minusDays(5);
        LocalDate fim = LocalDate.now();

        MetricaVendedor metrica1 = MetricaVendedor.builder()
            .visualizacoes(10)
            .contatos(2)
            .taxaConversao(20.0)
            .dataReferencia(inicio)
            .build();

        MetricaVendedor metrica2 = MetricaVendedor.builder()
            .visualizacoes(20)
            .contatos(3)
            .taxaConversao(15.0)
            .dataReferencia(fim)
            .build();

        RespostaMetricaVendedorDiaria resp1 = new RespostaMetricaVendedorDiaria(inicio, 10, 2, 20.0);
        RespostaMetricaVendedorDiaria resp2 = new RespostaMetricaVendedorDiaria(fim, 20, 3, 15.0);

        when(repositorioMetricaVendedor.findByVendedorIdAndDataReferenciaBetweenOrderByDataReferenciaAsc(vendedorId, inicio, fim))
            .thenReturn(List.of(metrica1, metrica2));
        when(mapperAnalytics.paraRespostaDiaria(metrica1)).thenReturn(resp1);
        when(mapperAnalytics.paraRespostaDiaria(metrica2)).thenReturn(resp2);

        RespostaAnalyticsVendedor result = servicoAnalytics.obterMetricasVendedor(vendedorId, inicio, fim);

        assertThat(result).isNotNull();
        assertThat(result.totalVisualizacoes()).isEqualTo(30);
        assertThat(result.totalContatos()).isEqualTo(5);
        assertThat(result.taxaConversao()).isCloseTo(16.6667, org.assertj.core.api.Assertions.within(0.001));
        assertThat(result.historico()).hasSize(2);
    }

    @Test
    @DisplayName("Deve obter métricas globais (admin) com sucesso")
    void deveObterMetricasGlobaisComSucesso() {
        LocalDate inicio = LocalDate.now().minusDays(5);
        LocalDate fim = LocalDate.now();

        MetricaAdmin metrica = MetricaAdmin.builder()
            .activeUsers(15)
            .totalAnuncios(5)
            .receitaTotal(BigDecimal.TEN)
            .dataReferencia(inicio)
            .build();

        RespostaMetricaAdminDiaria resp = new RespostaMetricaAdminDiaria(inicio, 15, 5, BigDecimal.TEN);

        when(repositorioMetricaAdmin.findByDataReferenciaBetweenOrderByDataReferenciaAsc(inicio, fim))
            .thenReturn(List.of(metrica));
        when(mapperAnalytics.paraRespostaDiaria(metrica)).thenReturn(resp);
        when(repositorioAnuncio.countByStatus(StatusAnuncio.PUBLICADO)).thenReturn(100L);
        when(usuarioRepository.countByUltimoAcessoEmBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(50L);

        RespostaAnalyticsAdmin result = servicoAnalytics.obterMetricasGlobais(inicio, fim);

        assertThat(result).isNotNull();
        assertThat(result.totalAnunciosAtivos()).isEqualTo(100);
        assertThat(result.totalUsuariosAtivos()).isEqualTo(50);
        assertThat(result.receitaTotalAcumulada()).isEqualByComparingTo(BigDecimal.TEN);
        assertThat(result.historico()).hasSize(1);
    }

    @Test
    @DisplayName("Deve realizar agregação diária com sucesso")
    void deveRealizarAgregacaoDiariaComSucesso() {
        Usuario usuario = Usuario.builder().id(UUID.randomUUID()).build();
        PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).usuario(usuario).build();

        when(perfilVendedorRepository.findAll()).thenReturn(List.of(perfil));
        when(repositorioMetricaAdmin.findByDataReferencia(any(LocalDate.class))).thenReturn(Optional.empty());
        when(repositorioMetricaVendedor.findByVendedorIdAndDataReferencia(any(UUID.class), any(LocalDate.class)))
            .thenReturn(Optional.empty());

        when(usuarioRepository.countByUltimoAcessoEmBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(10L);
        when(repositorioAnuncio.countByCriadoEmBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(5L);
        when(repositorioVisualizacaoAnuncio.countByAnuncioPerfilVendedorIdAndVistoBetween(any(UUID.class), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(100L);
        when(repositorioSalaChat.countByVendedorIdAndCriadaEmBetween(any(UUID.class), any(LocalDateTime.class), any(LocalDateTime.class)))
            .thenReturn(15L);

        servicoAnalytics.realizarAgregacaoDiaria();

        verify(repositorioMetricaAdmin, times(1)).save(any(MetricaAdmin.class));
        verify(repositorioMetricaVendedor, times(1)).save(any(MetricaVendedor.class));
    }
}
