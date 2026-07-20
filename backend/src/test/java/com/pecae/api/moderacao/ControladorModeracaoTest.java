package com.pecae.api.moderacao;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.configuracao.ConfiguracaoSeguranca;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.enums.CategoriaDenuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.entities.enums.TipoAlvoDenuncia;
import com.pecae.api.moderacao.controllers.ControladorModeracao;
import com.pecae.api.moderacao.dtos.request.DecisaoModeracaoRequest;
import com.pecae.api.moderacao.dtos.response.RespostaLogAuditoria;
import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import com.pecae.api.moderacao.services.IServicoModeracao;
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

@WebMvcTest(ControladorModeracao.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorModeracao")
class ControladorModeracaoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoModeracao servicoModeracao;

    @MockBean
    private ProvedorTokenJwt jwtTokenProvider;

    @MockBean
    private ServicoDetalhesUsuarioCustomizado customUserDetailsService;

    private UUID moderadorId;
    private UsernamePasswordAuthenticationToken authModerador;
    private UsernamePasswordAuthenticationToken authUsuarioComum;

    @BeforeEach
    void setUp() {
        moderadorId = UUID.randomUUID();
        PrincipalUsuario principalMod = PrincipalUsuario.builder()
            .id(moderadorId)
            .email("mod@test.com")
            .senha("password")
            .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_MODERADOR")))
            .ativo(true)
            .build();

        authModerador = new UsernamePasswordAuthenticationToken(principalMod, null, principalMod.getAuthorities());

        PrincipalUsuario principalUser = PrincipalUsuario.builder()
            .id(UUID.randomUUID())
            .email("user@test.com")
            .senha("password")
            .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")))
            .ativo(true)
            .build();

        authUsuarioComum = new UsernamePasswordAuthenticationToken(principalUser, null, principalUser.getAuthorities());
    }

    @Test
    @DisplayName("GET /moderacao/denuncias/pendentes - Deve retornar 200 OK para moderador")
    void deveListarDenunciasPendentesComSucesso() throws Exception {
        RespostaDenuncia resposta = new RespostaDenuncia(
            UUID.randomUUID(), UUID.randomUUID(), "Denunciante", TipoAlvoDenuncia.ANUNCIO, UUID.randomUUID(), CategoriaDenuncia.SPAM, "desc",
            StatusDenuncia.PENDENTE, LocalDateTime.now(), LocalDateTime.now()
        );

        PageImpl<RespostaDenuncia> pagina = new PageImpl<>(List.of(resposta), PageRequest.of(0, 20), 1);

        when(servicoModeracao.listarDenunciasPendentes(any(Pageable.class))).thenReturn(pagina);

        mockMvc.perform(get("/moderacao/denuncias/pendentes")
                .with(authentication(authModerador))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].categoria").value("SPAM"));

        verify(servicoModeracao, times(1)).listarDenunciasPendentes(any(Pageable.class));
    }

    @Test
    @DisplayName("GET /moderacao/denuncias/pendentes - Deve retornar 403 Forbidden para usuário comum")
    void deveLancarForbiddenParaUsuarioComumListandoDenuncias() throws Exception {
        mockMvc.perform(get("/moderacao/denuncias/pendentes")
                .with(authentication(authUsuarioComum))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isForbidden());

        verify(servicoModeracao, never()).listarDenunciasPendentes(any(Pageable.class));
    }

    @Test
    @DisplayName("POST /moderacao/denuncias/{id}/decisao - Deve aplicar decisão sobre denúncia com sucesso")
    void deveTomarDecisaoSobreDenunciaComSucesso() throws Exception {
        UUID denunciaId = UUID.randomUUID();
        DecisaoModeracaoRequest request = new DecisaoModeracaoRequest(AcaoModeracao.RESOLVER_DENUNCIA, "Resolvido");

        doNothing().when(servicoModeracao).processarDenuncia(eq(moderadorId), eq(denunciaId), any(DecisaoModeracaoRequest.class));

        mockMvc.perform(post("/moderacao/denuncias/{id}/decisao", denunciaId)
                .with(authentication(authModerador))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(servicoModeracao, times(1)).processarDenuncia(eq(moderadorId), eq(denunciaId), any(DecisaoModeracaoRequest.class));
    }

    @Test
    @DisplayName("POST /moderacao/anuncios/{id}/decisao - Deve aplicar decisão sobre anúncio com sucesso")
    void deveTomarDecisaoSobreAnuncioComSucesso() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        DecisaoModeracaoRequest request = new DecisaoModeracaoRequest(AcaoModeracao.APROVAR_ANUNCIO, "Aprovado");

        doNothing().when(servicoModeracao).moderarAnuncio(eq(moderadorId), eq(anuncioId), any(DecisaoModeracaoRequest.class));

        mockMvc.perform(post("/moderacao/anuncios/{id}/decisao", anuncioId)
                .with(authentication(authModerador))
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isNoContent());

        verify(servicoModeracao, times(1)).moderarAnuncio(eq(moderadorId), eq(anuncioId), any(DecisaoModeracaoRequest.class));
    }

    @Test
    @DisplayName("GET /moderacao/logs - Deve retornar logs de auditoria para moderador")
    void deveListarLogsComSucesso() throws Exception {
        RespostaLogAuditoria resposta = new RespostaLogAuditoria(
            UUID.randomUUID(), moderadorId, "Mod", AcaoModeracao.APROVAR_ANUNCIO, "ANUNCIO", UUID.randomUUID(), "Aprovado", LocalDateTime.now()
        );

        PageImpl<RespostaLogAuditoria> pagina = new PageImpl<>(List.of(resposta), PageRequest.of(0, 20), 1);

        when(servicoModeracao.listarLogsAuditoria(any(Pageable.class))).thenReturn(pagina);

        mockMvc.perform(get("/moderacao/logs")
                .with(authentication(authModerador))
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].acao").value("APROVAR_ANUNCIO"));

        verify(servicoModeracao, times(1)).listarLogsAuditoria(any(Pageable.class));
    }
}
