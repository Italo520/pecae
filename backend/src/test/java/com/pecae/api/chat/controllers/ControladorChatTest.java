package com.pecae.api.chat.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecae.api.chat.dtos.*;
import com.pecae.api.chat.services.IServicoChat;
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

@WebMvcTest(ControladorChat.class)
@Import(ConfiguracaoSeguranca.class)
@DisplayName("Testes do ControladorChat")
class ControladorChatTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private IServicoChat servicoChat;

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
                .email("test@pecae.com")
                .senha("hash")
                .autoridades(Collections.singletonList(new SimpleGrantedAuthority("ROLE_BUYER")))
                .ativo(true)
                .build();

        auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
    }

    @Test
    @DisplayName("Deve obter ou criar sala com sucesso")
    void deveObterOuCriarSala() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        RequisicaoCriarSala req = new RequisicaoCriarSala(anuncioId, null);
        
        RespostaInterlocutor interlocutor = new RespostaInterlocutor(UUID.randomUUID(), "Vendedor", "avatar");
        RespostaSalaChat resposta = new RespostaSalaChat(
                UUID.randomUUID(), anuncioId, null, "Civic 2020", "foto", UUID.randomUUID(),
                interlocutor, null, 0, LocalDateTime.now()
        );

        when(servicoChat.obterOuCriarSala(eq(usuarioId), any(RequisicaoCriarSala.class))).thenReturn(resposta);

        mockMvc.perform(post("/chat/rooms")
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tituloDaConversa").value("Civic 2020"))
                .andExpect(jsonPath("$.anuncioId").value(anuncioId.toString()));
    }

    @Test
    @DisplayName("Deve listar minhas salas")
    void deveListarMinhasSalas() throws Exception {
        RespostaInterlocutor interlocutor = new RespostaInterlocutor(UUID.randomUUID(), "Vendedor", "avatar");
        RespostaSalaChat sala = new RespostaSalaChat(
                UUID.randomUUID(), UUID.randomUUID(), null, "Conversa", "foto", UUID.randomUUID(),
                interlocutor, null, 3, LocalDateTime.now()
        );

        when(servicoChat.listarMinhasSalas(usuarioId)).thenReturn(List.of(sala));

        mockMvc.perform(get("/chat/rooms")
                        .with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].naoLidos").value(3))
                .andExpect(jsonPath("$[0].tituloDaConversa").value("Conversa"));
    }

    @Test
    @DisplayName("Deve buscar mensagens de uma sala")
    void deveBuscarMensagens() throws Exception {
        UUID salaId = UUID.randomUUID();
        RespostaMensagemChat msg = new RespostaMensagemChat(UUID.randomUUID(), salaId, usuarioId, "Olá", LocalDateTime.now());
        RespostaCursorMensagens cursorResponse = new RespostaCursorMensagens(List.of(msg), "next-cursor-base64");

        when(servicoChat.buscarMensagens(eq(salaId), eq(usuarioId), any())).thenReturn(cursorResponse);

        mockMvc.perform(get("/chat/rooms/{id}/messages", salaId)
                        .with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[0].conteudo").value("Olá"))
                .andExpect(jsonPath("$.proximoCursor").value("next-cursor-base64"));
    }

    @Test
    @DisplayName("Deve enviar mensagem via HTTP")
    void deveEnviarMensagemHttp() throws Exception {
        UUID salaId = UUID.randomUUID();
        RequisicaoEnviarMensagem req = new RequisicaoEnviarMensagem("Minha mensagem");
        RespostaMensagemChat resposta = new RespostaMensagemChat(UUID.randomUUID(), salaId, usuarioId, "Minha mensagem", LocalDateTime.now());

        when(servicoChat.enviarMensagem(eq(salaId), eq(usuarioId), eq("Minha mensagem"))).thenReturn(resposta);

        mockMvc.perform(post("/chat/rooms/{id}/messages", salaId)
                        .with(authentication(auth))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.conteudo").value("Minha mensagem"));
    }

    @Test
    @DisplayName("Deve marcar como lido")
    void deveMarcarComoLido() throws Exception {
        UUID salaId = UUID.randomUUID();

        doNothing().when(servicoChat).marcarComoLido(salaId, usuarioId);

        mockMvc.perform(put("/chat/rooms/{id}/read", salaId)
                        .with(authentication(auth))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
