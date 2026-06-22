package com.pecae.api.denuncia;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.configuracao.ConfiguracaoSeguranca;
import com.pecae.api.denuncia.controllers.ControladorDenuncia;
import com.pecae.api.denuncia.dtos.request.CriarDenunciaRequest;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.enums.CategoriaDenuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.entities.enums.TipoAlvoDenuncia;
import com.pecae.api.denuncia.services.IServicoDenuncia;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ControladorDenuncia.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorDenuncia")
class ControladorDenunciaTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoDenuncia servicoDenuncia;

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
            .email("denunciante@test.com")
            .senha("password")
            .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
            .ativo(true)
            .build();

        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("POST /api/v1/denuncias - Deve criar uma denúncia com sucesso")
    void deveSubmeterDenunciaComSucesso() throws Exception {
        UUID alvoId = UUID.randomUUID();
        CriarDenunciaRequest request = new CriarDenunciaRequest(TipoAlvoDenuncia.ANUNCIO, alvoId, CategoriaDenuncia.SPAM, "Spam excessivo");

        RespostaDenuncia resposta = new RespostaDenuncia(
            UUID.randomUUID(), usuarioId, "Denunciante", TipoAlvoDenuncia.ANUNCIO, alvoId, CategoriaDenuncia.SPAM, "Spam excessivo",
            StatusDenuncia.PENDENTE, LocalDateTime.now(), LocalDateTime.now()
        );

        when(servicoDenuncia.submeterDenuncia(eq(usuarioId), any(CriarDenunciaRequest.class))).thenReturn(resposta);

        mockMvc.perform(post("/api/v1/denuncias")
                .with(authentication(auth))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.idAlvo").value(alvoId.toString()))
            .andExpect(jsonPath("$.categoria").value("SPAM"))
            .andExpect(jsonPath("$.status").value("PENDENTE"));

        verify(servicoDenuncia, times(1)).submeterDenuncia(eq(usuarioId), any(CriarDenunciaRequest.class));
    }

    @Test
    @DisplayName("GET /api/v1/denuncias/minhas - Deve listar minhas denúncias com sucesso")
    void deveListarMinhasDenunciasComSucesso() throws Exception {
        RespostaDenuncia resposta = new RespostaDenuncia(
            UUID.randomUUID(), usuarioId, "Denunciante", TipoAlvoDenuncia.ANUNCIO, UUID.randomUUID(), CategoriaDenuncia.SPAM, "Spam excessivo",
            StatusDenuncia.PENDENTE, LocalDateTime.now(), LocalDateTime.now()
        );

        PageImpl<RespostaDenuncia> pagina = new PageImpl<>(List.of(resposta), PageRequest.of(0, 20), 1);

        when(servicoDenuncia.listarMinhasDenuncias(eq(usuarioId), any(Pageable.class))).thenReturn(pagina);

        mockMvc.perform(get("/api/v1/denuncias/minhas")
                .with(authentication(auth))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].reporterId").value(usuarioId.toString()))
            .andExpect(jsonPath("$.content[0].categoria").value("SPAM"));

        verify(servicoDenuncia, times(1)).listarMinhasDenuncias(eq(usuarioId), any(Pageable.class));
    }
}
