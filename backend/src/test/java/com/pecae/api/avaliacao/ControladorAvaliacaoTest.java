package com.pecae.api.avaliacao;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.avaliacao.controllers.ControladorAvaliacao;
import com.pecae.api.avaliacao.dtos.request.CriarAvaliacaoRequest;
import com.pecae.api.avaliacao.dtos.response.RespostaAvaliacao;
import com.pecae.api.avaliacao.services.IServicoAvaliacao;
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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ControladorAvaliacao.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorAvaliacao")
class ControladorAvaliacaoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoAvaliacao servicoAvaliacao;

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
                .email("reviewer@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
                .ativo(true)
                .build();

        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("POST /api/v1/avaliacoes - Deve criar ou atualizar uma avaliação com sucesso")
    void deveSubmeterAvaliacaoComSucesso() throws Exception {
        UUID vendedorId = UUID.randomUUID();
        CriarAvaliacaoRequest request = new CriarAvaliacaoRequest(vendedorId, 5, "Ótimo vendedor!");
        
        RespostaAvaliacao resposta = new RespostaAvaliacao(
                UUID.randomUUID(), vendedorId, usuarioId, "Avaliador Teste", 5, "Ótimo vendedor!",
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(servicoAvaliacao.submeterAvaliacao(eq(usuarioId), any(CriarAvaliacaoRequest.class))).thenReturn(resposta);

        mockMvc.perform(post("/avaliacoes")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.sellerId").value(vendedorId.toString()))
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.comment").value("Ótimo vendedor!"));

        verify(servicoAvaliacao, times(1)).submeterAvaliacao(eq(usuarioId), any(CriarAvaliacaoRequest.class));
    }

    @Test
    @DisplayName("GET /avaliacoes/vendedor/{vendedorId} - Deve listar avaliações de um vendedor de forma pública")
    void deveListarAvaliacoesDoVendedorComSucesso() throws Exception {
        UUID vendedorId = UUID.randomUUID();
        RespostaAvaliacao resposta = new RespostaAvaliacao(
                UUID.randomUUID(), vendedorId, UUID.randomUUID(), "Comprador A", 4, "Bom",
                LocalDateTime.now(), LocalDateTime.now()
        );

        PageImpl<RespostaAvaliacao> pagina = new PageImpl<>(List.of(resposta), PageRequest.of(0, 20), 1);

        when(servicoAvaliacao.listarAvaliacoesDoVendedor(eq(vendedorId), any(Pageable.class))).thenReturn(pagina);

        mockMvc.perform(get("/avaliacoes/vendedor/{vendedorId}", vendedorId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sellerId").value(vendedorId.toString()))
                .andExpect(jsonPath("$.content[0].rating").value(4))
                .andExpect(jsonPath("$.content[0].comment").value("Bom"));

        verify(servicoAvaliacao, times(1)).listarAvaliacoesDoVendedor(eq(vendedorId), any(Pageable.class));
    }

    @Test
    @DisplayName("DELETE /avaliacoes/{avaliacaoId} - Deve deletar uma avaliação com sucesso")
    void deveDeletarAvaliacaoComSucesso() throws Exception {
        UUID avaliacaoId = UUID.randomUUID();

        doNothing().when(servicoAvaliacao).deletarAvaliacao(eq(usuarioId), eq(avaliacaoId));

        mockMvc.perform(delete("/avaliacoes/{avaliacaoId}", avaliacaoId)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(servicoAvaliacao, times(1)).deletarAvaliacao(eq(usuarioId), eq(avaliacaoId));
    }
}
