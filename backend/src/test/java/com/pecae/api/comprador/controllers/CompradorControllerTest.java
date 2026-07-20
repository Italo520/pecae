package com.pecae.api.comprador.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.comprador.dtos.*;
import com.pecae.api.comprador.services.CompradorService;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CompradorController.class)
@DisplayName("Testes do CompradorController")
class CompradorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CompradorService compradorService;

    @MockBean
    private ProvedorTokenJwt jwtTokenProvider;

    @MockBean
    private ServicoDetalhesUsuarioCustomizado customUserDetailsService;

    private UUID usuarioId;
    private UsernamePasswordAuthenticationToken auth;

    @BeforeEach
    void setUp() {
        usuarioId = UUID.randomUUID();
        PrincipalUsuario principal = PrincipalUsuario.builder()
                .id(usuarioId)
                .email("buyer@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_BUYER")))
                .ativo(true)
                .build();

        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("GET /buyers/me - Deve retornar perfil do comprador logado")
    void deveRetornarMeuPerfil() throws Exception {
        RespostaCompradorMe resposta = RespostaCompradorMe.builder()
                .id(usuarioId)
                .email("buyer@test.com")
                .nome("Buyer Test")
                .perfilComprador(RespostaPerfilComprador.builder().nome("Buyer Test").build())
                .preferenciasNotificacao(RespostaPreferenciasNotificacao.builder().pushHabilitado(true).build())
                .build();

        when(compradorService.obterPerfilPorUsuarioId(usuarioId)).thenReturn(resposta);

        mockMvc.perform(get("/buyers/me")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("buyer@test.com"))
                .andExpect(jsonPath("$.buyerProfile.name").value("Buyer Test"))
                .andExpect(jsonPath("$.notificationPreferences.pushEnabled").value(true));

        verify(compradorService, times(1)).obterPerfilPorUsuarioId(usuarioId);
    }

    @Test
    @DisplayName("PUT /buyers/me - Deve atualizar perfil do comprador logado")
    void deveAtualizarMeuPerfil() throws Exception {
        AtualizarPreferenciasNotificacaoRequest atualizarPrefs = AtualizarPreferenciasNotificacaoRequest.builder().push(false).build();
        AtualizarCompradorRequest request = AtualizarCompradorRequest.builder()
                .nome("New Name")
                .preferenciasNotificacao(atualizarPrefs)
                .build();

        RespostaCompradorMe resposta = RespostaCompradorMe.builder()
                .id(usuarioId)
                .email("buyer@test.com")
                .nome("New Name")
                .perfilComprador(RespostaPerfilComprador.builder().nome("New Name").build())
                .preferenciasNotificacao(RespostaPreferenciasNotificacao.builder().pushHabilitado(false).build())
                .build();

        when(compradorService.atualizarPerfil(eq(usuarioId), any(AtualizarCompradorRequest.class))).thenReturn(resposta);

        mockMvc.perform(put("/buyers/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.buyerProfile.name").value("New Name"))
                .andExpect(jsonPath("$.notificationPreferences.pushEnabled").value(false));

        verify(compradorService, times(1)).atualizarPerfil(eq(usuarioId), any(AtualizarCompradorRequest.class));
    }

    @Test
    @DisplayName("DELETE /buyers/me - Deve inativar conta do comprador logado")
    void deveExcluirConta() throws Exception {
        ExcluirContaRequest request = ExcluirContaRequest.builder().senhaAtual("password123").build();

        doNothing().when(compradorService).excluirConta(eq(usuarioId), any(ExcluirContaRequest.class));

        mockMvc.perform(delete("/buyers/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(compradorService, times(1)).excluirConta(eq(usuarioId), any(ExcluirContaRequest.class));
    }

    @Test
    @DisplayName("GET /buyers/negotiations - Deve retornar lista vazia de negociações")
    void deveRetornarNegociacoes() throws Exception {
        mockMvc.perform(get("/buyers/negotiations")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
