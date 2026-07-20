package com.pecae.api.vendedor.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.vendedor.dtos.*;
import com.pecae.api.vendedor.entities.enums.TipoVendedor;
import com.pecae.api.vendedor.entities.enums.StatusVerificacao;
import com.pecae.api.vendedor.services.VendedorService;
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
import org.springframework.mock.web.MockMultipartFile;
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
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({VendedorController.class, VendedorVerificacaoController.class, VendedorMidiaController.class})
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes dos Controllers do Vendedor")
class VendedorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VendedorService vendedorService;

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
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_SELLER")))
                .ativo(true)
                .build();

        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("POST /sellers/me - Deve criar perfil de vendedor com sucesso")
    void deveCriarPerfil() throws Exception {
        CriarVendedorRequest request = new CriarVendedorRequest("Seller Name", "12345678901", "11999999999", TipoVendedor.CONCESSIONARIA);
        RespostaPerfilVendedor resposta = new RespostaPerfilVendedor(
                UUID.randomUUID(), usuarioId, "Seller Name", "12345678901", "11999999999",
                null, null, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
        );

        when(vendedorService.criarPerfil(eq(usuarioId), any(CriarVendedorRequest.class))).thenReturn(resposta);

        mockMvc.perform(post("/sellers/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Seller Name"))
                .andExpect(jsonPath("$.document").value("12345678901"))
                .andExpect(jsonPath("$.sellerType").value("CONCESSIONARIA"));

        verify(vendedorService, times(1)).criarPerfil(eq(usuarioId), any(CriarVendedorRequest.class));
    }

    @Test
    @DisplayName("GET /sellers/me - Deve retornar perfil do vendedor logado")
    void deveRetornarMeuPerfil() throws Exception {
        RespostaPerfilVendedor resposta = new RespostaPerfilVendedor(
                UUID.randomUUID(), usuarioId, "Seller Name", "12345678901", "11999999999",
                "Bio text", null, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
        );

        when(vendedorService.obterPerfilPorUsuarioId(usuarioId)).thenReturn(resposta);

        mockMvc.perform(get("/sellers/me")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Seller Name"))
                .andExpect(jsonPath("$.bio").value("Bio text"));

        verify(vendedorService, times(1)).obterPerfilPorUsuarioId(usuarioId);
    }

    @Test
    @DisplayName("PATCH /sellers/me - Deve atualizar perfil do vendedor logado")
    void deveAtualizarMeuPerfil() throws Exception {
        AtualizarVendedorRequest request = new AtualizarVendedorRequest("New Seller Name", "11988888888", "New bio");
        RespostaPerfilVendedor resposta = new RespostaPerfilVendedor(
                UUID.randomUUID(), usuarioId, "New Seller Name", "12345678901", "11988888888",
                "New bio", null, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
        );

        when(vendedorService.atualizarPerfil(eq(usuarioId), any(AtualizarVendedorRequest.class))).thenReturn(resposta);

        mockMvc.perform(patch("/sellers/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Seller Name"))
                .andExpect(jsonPath("$.phone").value("11988888888"))
                .andExpect(jsonPath("$.bio").value("New bio"));

        verify(vendedorService, times(1)).atualizarPerfil(eq(usuarioId), any(AtualizarVendedorRequest.class));
    }

    @Test
    @DisplayName("GET /sellers/{id}/public - Deve obter perfil público por ID")
    void deveObterPerfilPublicoPorId() throws Exception {
        UUID perfilId = UUID.randomUUID();
        RespostaPerfilVendedor resposta = new RespostaPerfilVendedor(
                perfilId, usuarioId, "Seller Name", "12345678901", "11999999999",
                "Bio text", null, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
        );

        when(vendedorService.obterPerfilPorId(perfilId)).thenReturn(resposta);

        mockMvc.perform(get("/sellers/{id}/public", perfilId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(perfilId.toString()))
                .andExpect(jsonPath("$.name").value("Seller Name"));

        verify(vendedorService, times(1)).obterPerfilPorId(perfilId);
    }

    @Test
    @DisplayName("DELETE /sellers/me - Deve inativar perfil")
    void deveExcluirPerfil() throws Exception {
        doNothing().when(vendedorService).excluirPerfil(usuarioId);

        mockMvc.perform(delete("/sellers/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(vendedorService, times(1)).excluirPerfil(usuarioId);
    }

    @Test
    @DisplayName("POST /sellers/me/verification - Deve solicitar verificação")
    void deveSolicitarVerificacao() throws Exception {
        RespostaVerificacaoVendedor resposta = new RespostaVerificacaoVendedor(
                UUID.randomUUID(), StatusVerificacao.PENDENTE, java.time.LocalDateTime.now(), null, null
        );

        when(vendedorService.solicitarVerificacao(usuarioId)).thenReturn(resposta);

        mockMvc.perform(post("/sellers/me/verification")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDENTE"));

        verify(vendedorService, times(1)).solicitarVerificacao(usuarioId);
    }

    @Test
    @DisplayName("POST /sellers/me/logo - Deve atualizar logo com mock file")
    void deveEnviarLogo() throws Exception {
        MockMultipartFile arquivo = new MockMultipartFile("file", "logo.png", "image/png", "some-image-data".getBytes());
        RespostaPerfilVendedor resposta = new RespostaPerfilVendedor(
                UUID.randomUUID(), usuarioId, "Seller Name", "12345678901", "11999999999",
                null, "http://fake-logo-url.png", null, TipoVendedor.CONCESSIONARIA, null, null, null, null
        );

        when(vendedorService.atualizarLogo(eq(usuarioId), anyString())).thenReturn(resposta);

        mockMvc.perform(multipart("/sellers/me/logo")
                        .file(arquivo)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.logoUrl").value("http://fake-logo-url.png"));

        verify(vendedorService, times(1)).atualizarLogo(eq(usuarioId), anyString());
    }

    @Test
    @DisplayName("POST /sellers/me/banner - Deve atualizar banner com mock file")
    void deveEnviarBanner() throws Exception {
        MockMultipartFile arquivo = new MockMultipartFile("file", "banner.png", "image/png", "some-image-data".getBytes());
        RespostaPerfilVendedor resposta = new RespostaPerfilVendedor(
                UUID.randomUUID(), usuarioId, "Seller Name", "12345678901", "11999999999",
                null, null, "http://fake-banner-url.png", TipoVendedor.CONCESSIONARIA, null, null, null, null
        );

        when(vendedorService.atualizarBanner(eq(usuarioId), anyString())).thenReturn(resposta);

        mockMvc.perform(multipart("/sellers/me/banner")
                        .file(arquivo)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bannerUrl").value("http://fake-banner-url.png"));

        verify(vendedorService, times(1)).atualizarBanner(eq(usuarioId), anyString());
    }
}
