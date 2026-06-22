package com.pecae.api.veiculo.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.ServicoDetalhesUsuarioCustomizado;
import com.pecae.api.configuracao.ConfiguracaoSeguranca;
import com.pecae.api.veiculo.dtos.CriarVeiculoRequest;
import com.pecae.api.veiculo.dtos.AtualizarVeiculoRequest;
import com.pecae.api.veiculo.dtos.RespostaDetalheVeiculo;
import com.pecae.api.veiculo.dtos.RespostaVeiculo;
import com.pecae.api.veiculo.services.IServicoVeiculo;
import com.pecae.api.veiculo.services.IServicoFotoVeiculo;
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

import java.util.ArrayList;
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

@WebMvcTest({ControladorVeiculo.class, ControladorFotoVeiculo.class})
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes dos Controllers do Veículo")
class ControladorVeiculoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoVeiculo servicoVeiculo;

    @MockBean
    private IServicoFotoVeiculo servicoFotoVeiculo;

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
    @DisplayName("POST /vehicles/me - Deve cadastrar veículo com sucesso")
    void deveCadastrarVeiculo() throws Exception {
        UUID versaoId = UUID.randomUUID();
        UUID anoId = UUID.randomUUID();

        CriarVeiculoRequest request = new CriarVeiculoRequest(
                versaoId, anoId, "ABC1234", "Preto", "São Paulo", "SP",
                -23.55, -46.63, "Sem observações", null, 10000, new ArrayList<>()
        );

        RespostaDetalheVeiculo resposta = new RespostaDetalheVeiculo(
                UUID.randomUUID(), UUID.randomUUID(), "Marca", "Modelo", "Versao", 2020,
                "ABC1234", "Preto", "São Paulo", "SP", -23.55, -46.63, "Sem observações",
                "RASCUNHO", "GASOLINA", 10000, new ArrayList<>(), new ArrayList<>(), null, null
        );

        when(servicoVeiculo.criar(eq(usuarioId), any(CriarVeiculoRequest.class))).thenReturn(resposta);

        mockMvc.perform(post("/vehicles/me")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.placa").value("ABC1234"))
                .andExpect(jsonPath("$.cor").value("Preto"))
                .andExpect(jsonPath("$.status").value("RASCUNHO"));

        verify(servicoVeiculo, times(1)).criar(eq(usuarioId), any(CriarVeiculoRequest.class));
    }

    @Test
    @DisplayName("GET /vehicles/me/{id} - Deve retornar detalhes do veículo")
    void deveObterDetalhes() throws Exception {
        UUID veiculoId = UUID.randomUUID();
        RespostaDetalheVeiculo resposta = new RespostaDetalheVeiculo(
                veiculoId, UUID.randomUUID(), "Marca", "Modelo", "Versao", 2020,
                "ABC1234", "Preto", "São Paulo", "SP", -23.55, -46.63, "Sem observações",
                "RASCUNHO", "GASOLINA", 10000, new ArrayList<>(), new ArrayList<>(), null, null
        );

        when(servicoVeiculo.buscarDetalhes(usuarioId, veiculoId)).thenReturn(resposta);

        mockMvc.perform(get("/vehicles/me/{veiculoId}", veiculoId)
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(veiculoId.toString()))
                .andExpect(jsonPath("$.placa").value("ABC1234"));

        verify(servicoVeiculo, times(1)).buscarDetalhes(usuarioId, veiculoId);
    }

    @Test
    @DisplayName("DELETE /vehicles/me/{id} - Deve excluir veículo com sucesso")
    void deveDeletarVeiculo() throws Exception {
        UUID veiculoId = UUID.randomUUID();
        doNothing().when(servicoVeiculo).deletar(usuarioId, veiculoId);

        mockMvc.perform(delete("/vehicles/me/{veiculoId}", veiculoId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(servicoVeiculo, times(1)).deletar(usuarioId, veiculoId);
    }
}
