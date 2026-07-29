package com.pecae.api.ad.jobs;

import com.pecae.api.ad.entities.CliqueAd;
import com.pecae.api.ad.entities.CriativoAd;
import com.pecae.api.ad.entities.ImpressaoAd;
import com.pecae.api.ad.repositories.RepositorioCliqueAd;
import com.pecae.api.ad.repositories.RepositorioCriativoAd;
import com.pecae.api.ad.repositories.RepositorioImpressaoAd;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do JobRastreamentoAd (Job Assíncrono de Métricas)")
class JobRastreamentoAdTest {

    @Mock
    private RepositorioImpressaoAd repositorioImpressao;

    @Mock
    private RepositorioCliqueAd repositorioClique;

    @Mock
    private RepositorioCriativoAd repositorioCriativo;

    @InjectMocks
    private JobRastreamentoAd jobRastreamento;

    @Nested
    @DisplayName("Registro de Impressões")
    class TestesImpressao {

        @Test
        @DisplayName("Deve registrar impressão com sucesso quando criativo existe")
        void deveRegistrarImpressaoComSucesso() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).tituloAlt("Banner Teste").build();

            when(repositorioCriativo.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioImpressao.save(any(ImpressaoAd.class))).thenAnswer(inv -> inv.getArgument(0));

            jobRastreamento.registrarImpressao(criativoId, "192.168.1.1", "Mozilla/5.0");

            verify(repositorioCriativo, times(1)).findById(criativoId);
            verify(repositorioImpressao, times(1)).save(any(ImpressaoAd.class));
        }

        @Test
        @DisplayName("Deve silenciar exceção quando criativo não existe para impressão (não derrubar thread)")
        void deveSilenciarExcecaoQuandoCriativoNaoExisteParaImpressao() {
            UUID criativoInexistente = UUID.randomUUID();
            when(repositorioCriativo.findById(criativoInexistente)).thenReturn(Optional.empty());

            // Não deve lançar exceção — o try-catch interno silencia
            assertThatNoException().isThrownBy(() ->
                    jobRastreamento.registrarImpressao(criativoInexistente, "10.0.0.1", "TestAgent")
            );

            verify(repositorioImpressao, never()).save(any());
        }

        @Test
        @DisplayName("Deve propagar IP e User-Agent corretamente para a entidade ImpressaoAd")
        void devePassarIpEUserAgentCorretos() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).build();
            String ipEsperado = "201.45.67.89";
            String uaEsperado = "Chrome/125.0";

            when(repositorioCriativo.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioImpressao.save(any(ImpressaoAd.class))).thenAnswer(inv -> inv.getArgument(0));

            jobRastreamento.registrarImpressao(criativoId, ipEsperado, uaEsperado);

            ArgumentCaptor<ImpressaoAd> captor = ArgumentCaptor.forClass(ImpressaoAd.class);
            verify(repositorioImpressao).save(captor.capture());

            ImpressaoAd salvo = captor.getValue();
            assertThat(salvo.getIpUsuario()).isEqualTo(ipEsperado);
            assertThat(salvo.getUserAgent()).isEqualTo(uaEsperado);
            assertThat(salvo.getCriativo()).isEqualTo(criativo);
        }
    }

    @Nested
    @DisplayName("Registro de Cliques")
    class TestesClique {

        @Test
        @DisplayName("Deve registrar clique com sucesso quando criativo existe")
        void deveRegistrarCliqueComSucesso() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).build();

            when(repositorioCriativo.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioClique.save(any(CliqueAd.class))).thenAnswer(inv -> inv.getArgument(0));

            jobRastreamento.registrarClique(criativoId, "192.168.1.1");

            verify(repositorioCriativo, times(1)).findById(criativoId);
            verify(repositorioClique, times(1)).save(any(CliqueAd.class));
        }

        @Test
        @DisplayName("Deve silenciar exceção quando criativo não existe para clique (não derrubar thread)")
        void deveSilenciarExcecaoQuandoCriativoNaoExisteParaClique() {
            UUID criativoInexistente = UUID.randomUUID();
            when(repositorioCriativo.findById(criativoInexistente)).thenReturn(Optional.empty());

            assertThatNoException().isThrownBy(() ->
                    jobRastreamento.registrarClique(criativoInexistente, "10.0.0.1")
            );

            verify(repositorioClique, never()).save(any());
        }

        @Test
        @DisplayName("Deve silenciar exceção quando save() falha (ex: constraint violation)")
        void deveSilenciarExcecaoQuandoSaveFalha() {
            UUID criativoId = UUID.randomUUID();
            CriativoAd criativo = CriativoAd.builder().id(criativoId).build();

            when(repositorioCriativo.findById(criativoId)).thenReturn(Optional.of(criativo));
            when(repositorioClique.save(any(CliqueAd.class)))
                    .thenThrow(new RuntimeException("Constraint violation simulada"));

            // Não deve propagar — o try-catch interno silencia
            assertThatNoException().isThrownBy(() ->
                    jobRastreamento.registrarClique(criativoId, "10.0.0.1")
            );
        }
    }
}
