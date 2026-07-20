package com.pecae.api.ad.controllers;

import com.pecae.api.ad.dtos.response.RespostaAdServido;
import com.pecae.api.ad.entities.enums.PlacementAd;
import com.pecae.api.ad.jobs.JobRastreamentoAd;
import com.pecae.api.ad.services.IServicoAd;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.configuracao.ConfiguracaoSeguranca;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ControladorAdPublico.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorAdPublico")
class ControladorAdPublicoTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IServicoAd servicoAd;

    @MockBean
    private JobRastreamentoAd jobRastreamento;

    @MockBean
    private ProvedorTokenJwt jwtTokenProvider;

    @MockBean
    private ServicoDetalhesUsuarioCustomizado customUserDetailsService;

    @Test
    @DisplayName("GET /ads/serve/{placement} - Deve servir anúncio se disponível")
    void deveServirAnuncioDisponivel() throws Exception {
        UUID criativoId = UUID.randomUUID();
        RespostaAdServido resposta = new RespostaAdServido(
                criativoId, "Alt text", "url_img", "url_dest", "CTA", PlacementAd.HOME_HERO
        );

        when(servicoAd.servirAnuncio(PlacementAd.HOME_HERO)).thenReturn(Optional.of(resposta));

        mockMvc.perform(get("/ads/serve/HOME_HERO")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.criativoId").value(criativoId.toString()))
                .andExpect(jsonPath("$.tituloAlt").value("Alt text"));

        verify(servicoAd, times(1)).servirAnuncio(PlacementAd.HOME_HERO);
    }

    @Test
    @DisplayName("GET /ads/serve/{placement} - Deve retornar 204 se não houver anúncio")
    void deveRetornar204SemAnuncio() throws Exception {
        when(servicoAd.servirAnuncio(PlacementAd.HOME_HERO)).thenReturn(Optional.empty());

        mockMvc.perform(get("/ads/serve/HOME_HERO")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(servicoAd, times(1)).servirAnuncio(PlacementAd.HOME_HERO);
    }

    @Test
    @DisplayName("POST /ads/{criativoId}/impression - Deve registrar visualização com sucesso e retornar 204")
    void deveRegistrarImpressao() throws Exception {
        UUID criativoId = UUID.randomUUID();
        doNothing().when(jobRastreamento).registrarImpressao(eq(criativoId), any(), any());

        mockMvc.perform(post("/ads/{criativoId}/impression", criativoId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(jobRastreamento, times(1)).registrarImpressao(eq(criativoId), any(), any());
    }

    @Test
    @DisplayName("POST /ads/{criativoId}/click - Deve registrar clique com sucesso e retornar 204")
    void deveRegistrarClique() throws Exception {
        UUID criativoId = UUID.randomUUID();
        doNothing().when(jobRastreamento).registrarClique(eq(criativoId), any());

        mockMvc.perform(post("/ads/{criativoId}/click", criativoId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(jobRastreamento, times(1)).registrarClique(eq(criativoId), any());
    }
}
