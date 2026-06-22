package com.pecae.api.anuncio.jobs;

import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.entities.VisualizacaoAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioVisualizacaoAnuncio;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do Job de Visualização de Anúncio")
class JobVisualizacaoAnuncioTest {

    @Mock
    private RepositorioAnuncio repositorioAnuncio;

    @Mock
    private RepositorioVisualizacaoAnuncio repositorioVisualizacao;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private JobVisualizacaoAnuncio jobVisualizacao;

    @Test
    @DisplayName("Deve ignorar visualização se o IP já visualizou na última hora (Cache Hit)")
    void registrarVisualizacao_quandoCacheHit_naoDeveSalvarNoDB() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        String ip = "192.168.1.100";

        when(redisTemplate.hasKey(anyString())).thenReturn(true);

        CompletableFuture<Void> resultado = jobVisualizacao.registrarVisualizacaoAsync(anuncioId, ip);
        resultado.get(); // Aguarda a execução assíncrona terminar no teste

        verify(repositorioAnuncio, never()).existsById(any(UUID.class));
        verify(repositorioVisualizacao, never()).save(any(VisualizacaoAnuncio.class));
        verify(repositorioAnuncio, never()).incrementarVisualizacoes(any(UUID.class));
    }

    @Test
    @DisplayName("Deve gravar visualização e incrementar contador se IP é novo (Cache Miss)")
    void registrarVisualizacao_quandoCacheMiss_deveSalvarEMarcarRedis() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        String ip = "192.168.1.100";

        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(repositorioAnuncio.existsById(anuncioId)).thenReturn(true);
        when(repositorioAnuncio.getReferenceById(anuncioId)).thenReturn(Anuncio.builder().id(anuncioId).build());
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        CompletableFuture<Void> resultado = jobVisualizacao.registrarVisualizacaoAsync(anuncioId, ip);
        resultado.get(); // Aguarda a execução assíncrona terminar no teste

        verify(repositorioVisualizacao, times(1)).save(any(VisualizacaoAnuncio.class));
        verify(repositorioAnuncio, times(1)).incrementarVisualizacoes(anuncioId);
        verify(valueOperations, times(1)).set(anyString(), eq("1"), any(Duration.class));
    }

    @Test
    @DisplayName("Deve ignorar e não salvar no DB se o anúncio correspondente não existir")
    void registrarVisualizacao_quandoAnuncioNaoExiste_naoDeveSalvar() throws Exception {
        UUID anuncioId = UUID.randomUUID();
        String ip = "192.168.1.100";

        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(repositorioAnuncio.existsById(anuncioId)).thenReturn(false);

        CompletableFuture<Void> resultado = jobVisualizacao.registrarVisualizacaoAsync(anuncioId, ip);
        resultado.get();

        verify(repositorioVisualizacao, never()).save(any(VisualizacaoAnuncio.class));
        verify(repositorioAnuncio, never()).incrementarVisualizacoes(any(UUID.class));
    }
}
