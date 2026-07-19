package com.pecae.api.ad.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.ad.dtos.request.RequisicaoCriarAnunciante;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCampanha;
import com.pecae.api.ad.dtos.request.RequisicaoCriarCriativo;
import com.pecae.api.ad.dtos.response.RespostaAnunciante;
import com.pecae.api.ad.dtos.response.RespostaCampanhaAd;
import com.pecae.api.ad.dtos.response.RespostaCriativoAd;
import com.pecae.api.ad.dtos.response.RespostaMetricaAd;
import com.pecae.api.ad.entities.enums.PlacementAd;
import com.pecae.api.ad.entities.enums.StatusCampanha;
import com.pecae.api.ad.services.IServicoAd;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ControladorAdAdmin.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorAdAdmin")
class ControladorAdAdminTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoAd servicoAd;

    @MockBean
    private ProvedorTokenJwt jwtTokenProvider;

    @MockBean
    private ServicoDetalhesUsuarioCustomizado customUserDetailsService;

    private UsernamePasswordAuthenticationToken authAdmin;
    private UsernamePasswordAuthenticationToken authSeller;

    @BeforeEach
    void setUp() {
        PrincipalUsuario admin = PrincipalUsuario.builder()
                .id(UUID.randomUUID())
                .email("admin@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .ativo(true)
                .build();
        authAdmin = new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities());

        PrincipalUsuario seller = PrincipalUsuario.builder()
                .id(UUID.randomUUID())
                .email("seller@test.com")
                .senha("password")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_VENDEDOR")))
                .ativo(true)
                .build();
        authSeller = new UsernamePasswordAuthenticationToken(seller, null, seller.getAuthorities());
    }

    @Test
    @DisplayName("POST /admin/ads/advertisers - Deve retornar 403 Forbidden para role VENDEDOR")
    void deveRetornar403ParaVendedorAoCriarAnunciante() throws Exception {
        RequisicaoCriarAnunciante request = new RequisicaoCriarAnunciante("Parceiro", "João", "joao@parceiro.com", "119999");

        mockMvc.perform(post("/admin/ads/advertisers")
                        .with(authentication(authSeller))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /admin/ads/advertisers - Deve criar anunciante com sucesso para role ADMIN")
    void deveCriarAnuncianteComSucessoParaAdmin() throws Exception {
        RequisicaoCriarAnunciante request = new RequisicaoCriarAnunciante("Parceiro", "João", "joao@parceiro.com", "119999");
        RespostaAnunciante resposta = new RespostaAnunciante(
                UUID.randomUUID(), "Parceiro", "João", "joao@parceiro.com", "119999", true, LocalDateTime.now()
        );

        when(servicoAd.criarAnunciante(any(RequisicaoCriarAnunciante.class))).thenReturn(resposta);

        mockMvc.perform(post("/admin/ads/advertisers")
                        .with(authentication(authAdmin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nomeEmpresa").value("Parceiro"))
                .andExpect(jsonPath("$.emailContato").value("joao@parceiro.com"));

        verify(servicoAd, times(1)).criarAnunciante(any(RequisicaoCriarAnunciante.class));
    }

    @Test
    @DisplayName("POST /admin/ads/campaigns - Deve criar campanha com sucesso para role ADMIN")
    void deveCriarCampanhaComSucessoParaAdmin() throws Exception {
        UUID anuncianteId = UUID.randomUUID();
        RequisicaoCriarCampanha request = new RequisicaoCriarCampanha(
                "Campanha 1", anuncianteId, LocalDate.now(), LocalDate.now().plusDays(30), BigDecimal.valueOf(1000), "Notas"
        );
        RespostaCampanhaAd resposta = new RespostaCampanhaAd(
                UUID.randomUUID(), "Campanha 1", null, StatusCampanha.RASCUNHO, LocalDate.now(), LocalDate.now().plusDays(30), BigDecimal.valueOf(1000), "Notas", LocalDateTime.now()
        );

        when(servicoAd.criarCampanha(any(RequisicaoCriarCampanha.class))).thenReturn(resposta);

        mockMvc.perform(post("/admin/ads/campaigns")
                        .with(authentication(authAdmin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nome").value("Campanha 1"))
                .andExpect(jsonPath("$.status").value("RASCUNHO"));

        verify(servicoAd, times(1)).criarCampanha(any(RequisicaoCriarCampanha.class));
    }

    @Test
    @DisplayName("GET /admin/ads/creatives/{id}/metrics - Deve retornar métricas do criativo para role ADMIN")
    void deveRetornarMetricasParaAdmin() throws Exception {
        UUID criativoId = UUID.randomUUID();
        RespostaMetricaAd resposta = new RespostaMetricaAd(criativoId, "Alt", 1000L, 50L, 5.0);

        when(servicoAd.obterMetricasCriativo(criativoId)).thenReturn(resposta);

        mockMvc.perform(get("/admin/ads/creatives/{criativoId}/metrics", criativoId)
                        .with(authentication(authAdmin))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalImpressoes").value(1000))
                .andExpect(jsonPath("$.totalCliques").value(50))
                .andExpect(jsonPath("$.ctr").value(5.0));

        verify(servicoAd, times(1)).obterMetricasCriativo(criativoId);
    }
}
