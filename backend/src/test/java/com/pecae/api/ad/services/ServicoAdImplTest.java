package com.pecae.api.ad.services;

import com.pecae.api.ad.dtos.request.RequisicaoCriarAnunciante;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCampanha;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCriativo;
import com.pecae.api.ad.dtos.response.*;
import com.pecae.api.ad.entities.Anunciante;
import com.pecae.api.ad.entities.CampanhaAd;
import com.pecae.api.ad.entities.CriativoAd;
import com.pecae.api.ad.entities.enums.PlacementAd;
import com.pecae.api.ad.entities.enums.StatusCampanha;
import com.pecae.api.ad.mappers.MapperAd;
import com.pecae.api.ad.repositories.*;
import com.pecae.api.ad.services.impl.ServicoAdImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoAd")
class ServicoAdImplTest {

    @Mock
    private RepositorioAnunciante repositorioAnunciante;

    @Mock
    private RepositorioCampanhaAd repositorioCampanhaAd;

    @Mock
    private RepositorioCriativoAd repositorioCriativoAd;

    @Mock
    private RepositorioImpressaoAd repositorioImpressaoAd;

    @Mock
    private RepositorioCliqueAd repositorioCliqueAd;

    @Mock
    private MapperAd mapperAd;

    @InjectMocks
    private ServicoAdImpl servicoAd;

    @Nested
    @DisplayName("Testes de Anunciante")
    class TestesAnunciante {

        @Test
        @DisplayName("Deve criar anunciante com sucesso")
        void deveCriarAnuncianteComSucesso() {
            RequisicaoCriarAnunciante req = new RequisicaoCriarAnunciante("Parceiro", "João", "joao@parceiro.com", "119999");
            Anunciante anunciante = Anunciante.builder().nomeEmpresa("Parceiro").ativo(true).build();
            RespostaAnunciante resposta = new RespostaAnunciante(UUID.randomUUID(), "Parceiro", "João", "joao@parceiro.com", "119999", true, LocalDateTime.now());

            when(repositorioAnunciante.existsByEmailContato(req.emailContato())).thenReturn(false);
            when(repositorioAnunciante.save(any(Anunciante.class))).thenReturn(anunciante);
            when(mapperAd.paraResposta(anunciante)).thenReturn(resposta);

            RespostaAnunciante resultado = servicoAd.criarAnunciante(req);

            assertThat(resultado).isNotNull();
            assertThat(resultado.nomeEmpresa()).isEqualTo("Parceiro");
            verify(repositorioAnunciante, times(1)).save(any(Anunciante.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio quando e-mail do anunciante já existe")
        void deveLancarExcecaoQuandoEmailDuplicado() {
            RequisicaoCriarAnunciante req = new RequisicaoCriarAnunciante("Parceiro", "João", "joao@parceiro.com", "119999");
            when(repositorioAnunciante.existsByEmailContato(req.emailContato())).thenReturn(true);

            assertThatThrownBy(() -> servicoAd.criarAnunciante(req))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Já existe um anunciante cadastrado com este e-mail.");
        }
    }

    @Nested
    @DisplayName("Testes de Campanha")
    class TestesCampanha {

        @Test
        @DisplayName("Deve criar campanha com sucesso")
        void deveCriarCampanhaComSucesso() {
            UUID anuncianteId = UUID.randomUUID();
            RequisicaoCriarCampanha req = new RequisicaoCriarCampanha(
                    "Campanha 1", anuncianteId, LocalDate.now(), LocalDate.now().plusDays(10), BigDecimal.TEN, "Notas"
            );
            Anunciante anunciante = Anunciante.builder().id(anuncianteId).ativo(true).build();
            CampanhaAd campanha = CampanhaAd.builder().nome("Campanha 1").anunciante(anunciante).build();
            RespostaCampanhaAd resposta = new RespostaCampanhaAd(
                    UUID.randomUUID(), "Campanha 1", null, StatusCampanha.RASCUNHO, LocalDate.now(), LocalDate.now().plusDays(10), BigDecimal.TEN, "Notas", LocalDateTime.now()
            );

            when(repositorioAnunciante.findById(anuncianteId)).thenReturn(Optional.of(anunciante));
            when(repositorioCampanhaAd.save(any(CampanhaAd.class))).thenReturn(campanha);
            when(mapperAd.paraResposta(campanha)).thenReturn(resposta);

            RespostaCampanhaAd resultado = servicoAd.criarCampanha(req);

            assertThat(resultado).isNotNull();
            assertThat(resultado.nome()).isEqualTo("Campanha 1");
            verify(repositorioCampanhaAd, times(1)).save(any(CampanhaAd.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se anunciante da campanha estiver inativo")
        void deveLancarExcecaoSeAnuncianteInativo() {
            UUID anuncianteId = UUID.randomUUID();
            RequisicaoCriarCampanha req = new RequisicaoCriarCampanha(
                    "Campanha 1", anuncianteId, LocalDate.now(), LocalDate.now().plusDays(10), BigDecimal.TEN, "Notas"
            );
            Anunciante anunciante = Anunciante.builder().id(anuncianteId).ativo(false).build();

            when(repositorioAnunciante.findById(anuncianteId)).thenReturn(Optional.of(anunciante));

            assertThatThrownBy(() -> servicoAd.criarCampanha(req))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Não é possível criar campanha para um anunciante inativo.");
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se data de início for posterior à data de fim")
        void deveLancarExcecaoSePeriodoInvalido() {
            UUID anuncianteId = UUID.randomUUID();
            RequisicaoCriarCampanha req = new RequisicaoCriarCampanha(
                    "Campanha 1", anuncianteId, LocalDate.now().plusDays(5), LocalDate.now(), BigDecimal.TEN, "Notas"
            );
            Anunciante anunciante = Anunciante.builder().id(anuncianteId).ativo(true).build();

            when(repositorioAnunciante.findById(anuncianteId)).thenReturn(Optional.of(anunciante));

            assertThatThrownBy(() -> servicoAd.criarCampanha(req))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("A data de início não pode ser posterior à data de fim.");
        }
    }

    @Nested
    @DisplayName("Testes de Exibição e Métricas")
    class TestesExibicaoMetricas {

        @Test
        @DisplayName("Deve servir criativo ativo de maior prioridade para placement")
        void deveServirMelhorCriativo() {
            PlacementAd placement = PlacementAd.HOME_HERO;
            CriativoAd criativo = CriativoAd.builder().id(UUID.randomUUID()).prioridade(10).ativo(true).build();
            RespostaAdServido resposta = new RespostaAdServido(
                    criativo.getId(), "Alt", "url", "dest", "cta", placement
            );

            when(repositorioCriativoAd.findActiveCreativesForPlacement(eq(placement), any(LocalDate.class), any(Pageable.class)))
                    .thenReturn(List.of(criativo));
            when(mapperAd.paraRespostaServido(criativo)).thenReturn(resposta);

            Optional<RespostaAdServido> resultado = servicoAd.servirAnuncio(placement);

            assertThat(resultado).isPresent();
            assertThat(resultado.get().criativoId()).isEqualTo(criativo.getId());
        }

        @Test
        @DisplayName("Deve retornar vazio se nenhum criativo ativo for encontrado para o placement")
        void deveRetornarVazioSeNenhumAtivo() {
            PlacementAd placement = PlacementAd.HOME_HERO;
            when(repositorioCriativoAd.findActiveCreativesForPlacement(eq(placement), any(LocalDate.class), any(Pageable.class)))
                    .thenReturn(Collections.emptyList());

            Optional<RespostaAdServido> resultado = servicoAd.servirAnuncio(placement);

            assertThat(resultado).isEmpty();
        }

        @Test
        @DisplayName("Deve calcular CTR corretamente nas métricas")
        void deveCalcularCtrCorretamente() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).tituloAlt("Banner").build();

            when(repositorioCriativoAd.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioImpressaoAd.countByCriativoId(criativoId)).thenReturn(200L);
            when(repositorioCliqueAd.countByCriativoId(criativoId)).thenReturn(10L);

            RespostaMetricaAd resultado = servicoAd.obterMetricasCriativo(criativoId);

            assertThat(resultado).isNotNull();
            assertThat(resultado.totalImpressoes()).isEqualTo(200L);
            assertThat(resultado.totalCliques()).isEqualTo(10L);
            assertThat(resultado.ctr()).isEqualTo(5.0); // (10 / 200) * 100
        }

        @Test
        @DisplayName("Deve retornar CTR zero se não houver impressões")
        void deveRetornarCtrZeroSeSemImpressoes() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).tituloAlt("Banner").build();

            when(repositorioCriativoAd.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioImpressaoAd.countByCriativoId(criativoId)).thenReturn(0L);
            when(repositorioCliqueAd.countByCriativoId(criativoId)).thenReturn(0L);

            RespostaMetricaAd resultado = servicoAd.obterMetricasCriativo(criativoId);

            assertThat(resultado).isNotNull();
            assertThat(resultado.ctr()).isEqualTo(0.0);
        }
    }

    @Nested
    @DisplayName("Testes de Criativos (Banners)")
    class TestesCriativos {

        @Test
        @DisplayName("Deve criar criativo com sucesso quando campanha existe")
        void deveCriarCriativoComSucesso() {
            UUID campanhaId = UUID.randomUUID();
            RequisicaoCriarCriativo req = new RequisicaoCriarCriativo(
                    campanhaId, "Banner Peças", "https://img.pecae.com/banner.png",
                    "https://pecae.com/busca", "Compre Agora", PlacementAd.HOME_HERO, 10
            );
            CampanhaAd campanha = CampanhaAd.builder().id(campanhaId).nome("Campanha 1").build();
            CriativoAd criativo = CriativoAd.builder().id(UUID.randomUUID()).campanha(campanha).build();
            RespostaCriativoAd resposta = new RespostaCriativoAd(
                    criativo.getId(), campanhaId, "Banner Peças", "https://img.pecae.com/banner.png",
                    "https://pecae.com/busca", "Compre Agora", PlacementAd.HOME_HERO, 10, true, null
            );

            when(repositorioCampanhaAd.findById(campanhaId)).thenReturn(Optional.of(campanha));
            when(repositorioCriativoAd.save(any(CriativoAd.class))).thenReturn(criativo);
            when(mapperAd.paraResposta(criativo)).thenReturn(resposta);

            RespostaCriativoAd resultado = servicoAd.criarCriativo(req);

            assertThat(resultado).isNotNull();
            assertThat(resultado.tituloAlt()).isEqualTo("Banner Peças");
            verify(repositorioCriativoAd, times(1)).save(any(CriativoAd.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado ao criar criativo com campanha inexistente")
        void deveLancarExcecaoSeCriativoCampanhaNaoExiste() {
            UUID campanhaInexistente = UUID.randomUUID();
            RequisicaoCriarCriativo req = new RequisicaoCriarCriativo(
                    campanhaInexistente, "Banner", "url", "dest", "cta", PlacementAd.HOME_HERO, 0
            );

            when(repositorioCampanhaAd.findById(campanhaInexistente)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> servicoAd.criarCriativo(req))
                    .isInstanceOf(ExcecaoRecursoNaoEncontrado.class);
        }

        @Test
        @DisplayName("Deve listar criativos de uma campanha existente")
        void deveListarCriativosDaCampanhaExistente() {
            UUID campanhaId = UUID.randomUUID();
            List<CriativoAd> criativos = List.of(
                    CriativoAd.builder().id(UUID.randomUUID()).build(),
                    CriativoAd.builder().id(UUID.randomUUID()).build()
            );

            when(repositorioCampanhaAd.existsById(campanhaId)).thenReturn(true);
            when(repositorioCriativoAd.findByCampanhaId(campanhaId)).thenReturn(criativos);
            when(mapperAd.paraListaCriativos(criativos)).thenReturn(List.of());

            servicoAd.listarCriativosDaCampanha(campanhaId);

            verify(repositorioCriativoAd, times(1)).findByCampanhaId(campanhaId);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado ao listar criativos de campanha inexistente")
        void deveLancarExcecaoSeListarCriativosDeCampanhaInexistente() {
            UUID campanhaInexistente = UUID.randomUUID();
            when(repositorioCampanhaAd.existsById(campanhaInexistente)).thenReturn(false);

            assertThatThrownBy(() -> servicoAd.listarCriativosDaCampanha(campanhaInexistente))
                    .isInstanceOf(ExcecaoRecursoNaoEncontrado.class);
        }
    }

    @Nested
    @DisplayName("Testes de Toggle Ativo/Desativo")
    class TestesToggle {

        @Test
        @DisplayName("Deve ativar/desativar anunciante com sucesso")
        void deveAtivarDesativarAnunciante() {
            UUID anuncianteId = UUID.randomUUID();
            Anunciante anunciante = Anunciante.builder().id(anuncianteId).ativo(true).build();
            RespostaAnunciante resposta = new RespostaAnunciante(
                    anuncianteId, "Empresa", "Contato", "email@test.com", "119999", false, null
            );

            when(repositorioAnunciante.findById(anuncianteId)).thenReturn(Optional.of(anunciante));
            when(repositorioAnunciante.save(any(Anunciante.class))).thenReturn(anunciante);
            when(mapperAd.paraResposta(anunciante)).thenReturn(resposta);

            RespostaAnunciante resultado = servicoAd.ativarDesativarAnunciante(anuncianteId, false);

            assertThat(resultado).isNotNull();
            verify(repositorioAnunciante, times(1)).save(any(Anunciante.class));
        }

        @Test
        @DisplayName("Deve ativar/desativar criativo com sucesso")
        void deveAtivarDesativarCriativo() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).ativo(true).build();
            RespostaCriativoAd resposta = new RespostaCriativoAd(
                    criativoId, UUID.randomUUID(), "Alt", "url", "dest", "cta", PlacementAd.HOME_HERO, 0, false, null
            );

            when(repositorioCriativoAd.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioCriativoAd.save(any(CriativoAd.class))).thenReturn(criativo);
            when(mapperAd.paraResposta(criativo)).thenReturn(resposta);

            RespostaCriativoAd resultado = servicoAd.ativarDesativarCriativo(criativoId, false);

            assertThat(resultado).isNotNull();
            verify(repositorioCriativoAd, times(1)).save(any(CriativoAd.class));
        }
    }

    @Nested
    @DisplayName("Testes de Listagem e Filtros")
    class TestesListagemFiltros {

        @Test
        @DisplayName("Deve listar campanhas filtrando por status ATIVA")
        void deveListarCampanhasComFiltroDeStatus() {
            StatusCampanha filtro = StatusCampanha.ATIVA;
            Pageable pageable = PageRequest.of(0, 10);
            CampanhaAd campanha = CampanhaAd.builder().nome("Campanha Ativa").status(StatusCampanha.ATIVA).build();
            Page<CampanhaAd> page = new PageImpl<>(List.of(campanha));
            RespostaCampanhaAd resposta = new RespostaCampanhaAd(
                    UUID.randomUUID(), "Campanha Ativa", null, StatusCampanha.ATIVA,
                    LocalDate.now(), LocalDate.now().plusDays(30), null, null, null
            );

            when(repositorioCampanhaAd.findByStatus(filtro, pageable)).thenReturn(page);
            when(mapperAd.paraResposta(campanha)).thenReturn(resposta);

            Page<RespostaCampanhaAd> resultado = servicoAd.listarCampanhas(filtro, pageable);

            assertThat(resultado.getContent()).hasSize(1);
            verify(repositorioCampanhaAd, times(1)).findByStatus(filtro, pageable);
            verify(repositorioCampanhaAd, never()).findAll(pageable);
        }
    }
}
