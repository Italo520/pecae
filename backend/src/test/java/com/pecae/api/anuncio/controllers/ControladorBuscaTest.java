package com.pecae.api.anuncio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.anuncio.dtos.RespostaSugestaoAutocomplete;
import com.pecae.api.anuncio.services.IServicoAnuncio;
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

import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ControladorBusca.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorBusca")
class ControladorBuscaTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IServicoAnuncio servicoAnuncio;

    @MockBean
    private ProvedorTokenJwt jwtTokenProvider;

    @MockBean
    private ServicoDetalhesUsuarioCustomizado customUserDetailsService;

    @Test
    @DisplayName("Deve retornar sugestoes de autocomplete com sucesso")
    void deveRetornarSugestoesComSucesso() throws Exception {
        RespostaSugestaoAutocomplete sugestao = new RespostaSugestaoAutocomplete(
            "123",
            "Fiat Palio",
            RespostaSugestaoAutocomplete.TipoSugestao.MODEL
        );

        when(servicoAnuncio.buscarSugestoes("Palio")).thenReturn(List.of(sugestao));

        mockMvc.perform(get("/search/suggestions")
                .param("q", "Palio")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("123"))
                .andExpect(jsonPath("$[0].text").value("Fiat Palio"))
                .andExpect(jsonPath("$[0].type").value("MODEL"));
    }
}
