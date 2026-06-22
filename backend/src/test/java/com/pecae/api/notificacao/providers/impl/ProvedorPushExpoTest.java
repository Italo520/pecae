package com.pecae.api.notificacao.providers.impl;

import com.pecae.api.notificacao.exceptions.ExcecaoPush;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ProvedorPushExpo")
class ProvedorPushExpoTest {

    @Mock
    private RestTemplate restTemplate;

    private ProvedorPushExpo provedorPushExpo;

    @BeforeEach
    void setUp() throws Exception {
        provedorPushExpo = new ProvedorPushExpo(null);
        
        // Injetar o restTemplate mockado via reflection
        Field field = ProvedorPushExpo.class.getDeclaredField("restTemplate");
        field.setAccessible(true);
        field.set(provedorPushExpo, restTemplate);
    }

    @Test
    @DisplayName("Deve enviar push notifications com sucesso via Expo")
    void deveEnviarPushComSucesso() {
        List<String> tokens = List.of("ExponentPushToken[123]");
        Map<String, Object> dados = Map.of("key", "value");

        ResponseEntity<String> response = new ResponseEntity<>("{\"data\":[]}", HttpStatus.OK);
        when(restTemplate.postForEntity(eq("https://exp.host/--/api/v2/push/send"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(response);

        provedorPushExpo.enviar(tokens, "Titulo", "Corpo", dados);

        verify(restTemplate, times(1))
                .postForEntity(eq("https://exp.host/--/api/v2/push/send"), any(HttpEntity.class), eq(String.class));
    }

    @Test
    @DisplayName("Deve lançar ExcecaoPush ao receber status HTTP de erro da API do Expo")
    void deveLancarExcecaoQuandoRetornarStatusErro() {
        List<String> tokens = List.of("ExponentPushToken[123]");
        ResponseEntity<String> response = new ResponseEntity<>("Erro na API", HttpStatus.BAD_REQUEST);

        when(restTemplate.postForEntity(eq("https://exp.host/--/api/v2/push/send"), any(HttpEntity.class), eq(String.class)))
                .thenReturn(response);

        assertThatThrownBy(() -> provedorPushExpo.enviar(tokens, "Titulo", "Corpo", Collections.emptyMap()))
                .isInstanceOf(ExcecaoPush.class)
                .hasMessageContaining("Falha ao enviar push via Expo. Status: 400");
    }

    @Test
    @DisplayName("Deve lançar ExcecaoPush no caso de exceção de rede (Timeout, etc)")
    void deveLancarExcecaoQuandoOcorrerErroDeRede() {
        List<String> tokens = List.of("ExponentPushToken[123]");

        when(restTemplate.postForEntity(eq("https://exp.host/--/api/v2/push/send"), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new ResourceAccessException("Timeout de rede"));

        assertThatThrownBy(() -> provedorPushExpo.enviar(tokens, "Titulo", "Corpo", Collections.emptyMap()))
                .isInstanceOf(ExcecaoPush.class)
                .hasMessageContaining("Falha na comunicação com o serviço Expo Push");
    }

    @Test
    @DisplayName("Deve retornar imediatamente sem chamar a API se a lista de tokens estiver vazia")
    void deveRetornarSeListaDeTokensForVazia() {
        provedorPushExpo.enviar(Collections.emptyList(), "Titulo", "Corpo", Collections.emptyMap());

        verify(restTemplate, never())
                .postForEntity(any(String.class), any(HttpEntity.class), any());
    }
}
