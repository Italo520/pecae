package com.pecae.api.catalogo.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.services.CatalogoService;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.configuracao.ConfiguracaoSeguranca;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({CatalogoController.class, AdminCatalogoController.class})
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes dos Controllers do Catálogo")
class CatalogoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CatalogoService catalogoService;

    @MockBean
    private ProvedorTokenJwt jwtTokenProvider;

    @MockBean
    private ServicoDetalhesUsuarioCustomizado customUserDetailsService;

    private UsernamePasswordAuthenticationToken adminAuth;
    private UsernamePasswordAuthenticationToken userAuth;

    @BeforeEach
    void setUp() {
        UUID adminId = UUID.randomUUID();
        PrincipalUsuario adminPrincipal = PrincipalUsuario.builder()
                .id(adminId)
                .email("admin@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .ativo(true)
                .build();
        adminAuth = new UsernamePasswordAuthenticationToken(adminPrincipal, null, adminPrincipal.getAuthorities());

        UUID usuarioId = UUID.randomUUID();
        PrincipalUsuario userPrincipal = PrincipalUsuario.builder()
                .id(usuarioId)
                .email("user@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_BUYER")))
                .ativo(true)
                .build();
        userAuth = new UsernamePasswordAuthenticationToken(userPrincipal, null, userPrincipal.getAuthorities());
    }

    @Test
    @DisplayName("GET /catalog/brands - Deve permitir acesso público")
    void devePermitirAcessoPublicoParaObterMarcas() throws Exception {
        RespostaMarca resposta = new RespostaMarca(UUID.randomUUID(), "Toyota", "http://logo.png");
        when(catalogoService.obterTodasMarcas()).thenReturn(List.of(resposta));

        mockMvc.perform(get("/catalog/brands")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Toyota"));

        verify(catalogoService, times(1)).obterTodasMarcas();
    }

    @Test
    @DisplayName("POST /admin/catalog/brands - Deve retornar 403 Forbidden para usuário comum")
    void deveNegarAcessoParaNaoAdminCriarMarca() throws Exception {
        CriarMarcaRequest request = new CriarMarcaRequest("Toyota", "http://logo.png");

        mockMvc.perform(post("/admin/catalog/brands")
                        .with(authentication(userAuth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());

        verify(catalogoService, never()).criarMarca(any());
    }

    @Test
    @DisplayName("POST /admin/catalog/brands - Deve criar marca quando usuário for ADMIN")
    void deveCriarMarcaQuandoAdmin() throws Exception {
        CriarMarcaRequest request = new CriarMarcaRequest("Toyota", "http://logo.png");
        RespostaMarca resposta = new RespostaMarca(UUID.randomUUID(), "Toyota", "http://logo.png");

        when(catalogoService.criarMarca(any(CriarMarcaRequest.class))).thenReturn(resposta);

        mockMvc.perform(post("/admin/catalog/brands")
                        .with(authentication(adminAuth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Toyota"));

        verify(catalogoService, times(1)).criarMarca(any(CriarMarcaRequest.class));
    }
}
