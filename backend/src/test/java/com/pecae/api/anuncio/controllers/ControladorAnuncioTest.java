package com.pecae.api.anuncio.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.anuncio.dtos.*;
import com.pecae.api.anuncio.services.IServicoAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.configuracao.ConfiguracaoSeguranca;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
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

@WebMvcTest(ControladorAnuncio.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorAnuncio")
class ControladorAnuncioTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoAnuncio servicoAnuncio;

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
                .email("seller@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_VENDEDOR")))
                .ativo(true)
                .build();

        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("GET /listings - Deve listar anúncios públicos com sucesso")
    void deveListarPublicos() throws Exception {
        RespostaAnuncio resposta = new RespostaAnuncio(
            UUID.randomUUID(), "Título Anúncio", "PUBLICADO", 0, "Fiat", "Uno", "1.0 Mille", 2012, "Vermelho", "São Paulo", "SP", null, UUID.randomUUID(), "Vendedor", true, LocalDateTime.now(), false
        );
        Page<RespostaAnuncio> page = new PageImpl<>(Collections.singletonList(resposta));

        when(servicoAnuncio.listarPublicos(any(FiltrosAnuncioQuery.class))).thenReturn(page);

        mockMvc.perform(get("/listings")
                        .param("pagina", "0")
                        .param("tamanho", "20")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].titulo").value("Título Anúncio"))
                .andExpect(jsonPath("$.content[0].status").value("PUBLICADO"));

        verify(servicoAnuncio, times(1)).listarPublicos(any(FiltrosAnuncioQuery.class));
    }

    @Test
    @DisplayName("GET /listings/{id} - Deve retornar detalhes do anúncio")
    void deveBuscarDetalhe() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        RespostaDetalheAnuncio resposta = new RespostaDetalheAnuncio(
            anuncioId, "Título Anúncio", "Descrição", "PUBLICADO", 10, 5, UUID.randomUUID(), "Fiat", "Uno", "1.0 Mille", 2012, "Vermelho", "obs", 150000, Collections.emptyList(), Collections.emptyList(), "São Paulo", "SP", null, null, UUID.randomUUID(), "Vendedor", "119999", "logo", true, 4.8, 15, LocalDateTime.now(), LocalDateTime.now(), null, null
        );

        when(servicoAnuncio.buscarDetalhe(eq(anuncioId), anyString())).thenReturn(resposta);

        mockMvc.perform(get("/listings/{anuncioId}", anuncioId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(anuncioId.toString()))
                .andExpect(jsonPath("$.titulo").value("Título Anúncio"));

        verify(servicoAnuncio, times(1)).buscarDetalhe(eq(anuncioId), anyString());
    }

    @Test
    @DisplayName("GET /listings/{id} - Deve retornar 404 quando anúncio não existir")
    void deveRetornar404AoBuscarInexistente() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        when(servicoAnuncio.buscarDetalhe(eq(anuncioId), anyString()))
                .thenThrow(new ExcecaoRecursoNaoEncontrado("Anúncio não encontrado"));

        mockMvc.perform(get("/listings/{anuncioId}", anuncioId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /listings/me - Deve retornar 401 ao tentar criar sem autenticação")
    void criar_semAutenticacao_deveRetornar401() throws Exception {
        CriarAnuncioRequest request = new CriarAnuncioRequest(UUID.randomUUID(), "Título do Anúncio", "Descrição");

        mockMvc.perform(post("/listings/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /listings/me - Deve criar anúncio com sucesso")
    void deveCriarAnuncio() throws Exception {
        UUID veiculoId = UUID.randomUUID();
        CriarAnuncioRequest request = new CriarAnuncioRequest(veiculoId, "Título do Anúncio", "Descrição do Anúncio");
        RespostaDetalheAnuncio resposta = new RespostaDetalheAnuncio(
            UUID.randomUUID(), "Título do Anúncio", "Descrição do Anúncio", "PENDENTE", 0, 0, veiculoId, "Fiat", "Uno", "1.0 Mille", 2012, "Vermelho", "obs", 150000, Collections.emptyList(), Collections.emptyList(), "São Paulo", "SP", null, null, UUID.randomUUID(), "Vendedor", "119999", "logo", true, 4.8, 15, LocalDateTime.now(), null, null, null
        );

        when(servicoAnuncio.criar(eq(usuarioId), any(CriarAnuncioRequest.class))).thenReturn(resposta);

        mockMvc.perform(post("/listings/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Título do Anúncio"))
                .andExpect(jsonPath("$.status").value("PENDENTE"));

        verify(servicoAnuncio, times(1)).criar(eq(usuarioId), any(CriarAnuncioRequest.class));
    }

    @Test
    @DisplayName("POST /listings/me - Deve retornar 400 se o corpo for inválido")
    void criar_comCorpoInvalido_deveRetornar400() throws Exception {
        CriarAnuncioRequest request = new CriarAnuncioRequest(null, "", "Descrição");

        mockMvc.perform(post("/listings/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    @DisplayName("PATCH /listings/me/{id}/sold - Deve marcar como vendido com sucesso")
    void deveMarcarComoVendido() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        doNothing().when(servicoAnuncio).marcarComoVendido(usuarioId, anuncioId);

        mockMvc.perform(patch("/listings/me/{anuncioId}/sold", anuncioId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(servicoAnuncio, times(1)).marcarComoVendido(usuarioId, anuncioId);
    }

    @Test
    @DisplayName("DELETE /listings/me/{id} - Deve excluir anúncio com sucesso")
    void deveDeletarAnuncio() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        doNothing().when(servicoAnuncio).remover(usuarioId, anuncioId);

        mockMvc.perform(delete("/listings/me/{anuncioId}", anuncioId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(servicoAnuncio, times(1)).remover(usuarioId, anuncioId);
    }
}
