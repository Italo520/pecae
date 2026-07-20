package com.pecae.api.chat.services.impl;

import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.chat.dtos.*;
import com.pecae.api.chat.entities.LeituraSala;
import com.pecae.api.chat.entities.MensagemChat;
import com.pecae.api.chat.entities.SalaChat;
import com.pecae.api.chat.mappers.MapperChat;
import com.pecae.api.chat.repositories.RepositorioLeituraSala;
import com.pecae.api.chat.repositories.RepositorioMensagemChat;
import com.pecae.api.chat.repositories.RepositorioSalaChat;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.pecae.api.notificacao.services.IServicoNotificacao;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoChatImpl")
class ServicoChatImplTest {

    @Mock
    private RepositorioSalaChat repositorioSalaChat;
    @Mock
    private RepositorioMensagemChat repositorioMensagemChat;
    @Mock
    private RepositorioLeituraSala repositorioLeituraSala;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private RepositorioAnuncio repositorioAnuncio;
    @Mock
    private RepositorioVeiculo repositorioVeiculo;
    @Mock
    private MapperChat mapperChat;
    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private IServicoNotificacao servicoNotificacao;

    @InjectMocks
    private ServicoChatImpl servicoChat;

    private UUID compradorId;
    private UUID vendedorId;
    private UUID anuncioId;
    private UUID veiculoId;

    private Usuario comprador;
    private Usuario vendedor;
    private PerfilVendedor perfilVendedor;
    private Anuncio anuncio;
    private Veiculo veiculo;
    private SalaChat sala;

    @BeforeEach
    void setUp() {
        compradorId = UUID.randomUUID();
        vendedorId = UUID.randomUUID();
        anuncioId = UUID.randomUUID();
        veiculoId = UUID.randomUUID();

        comprador = Usuario.builder().id(compradorId).nome("Comprador").avatar("comprador_avatar").build();
        vendedor = Usuario.builder().id(vendedorId).nome("Vendedor").avatar("vendedor_avatar").build();

        perfilVendedor = PerfilVendedor.builder().id(UUID.randomUUID()).usuario(vendedor).build();

        anuncio = Anuncio.builder().id(anuncioId).perfilVendedor(perfilVendedor).titulo("Anúncio Peça").build();
        veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(perfilVendedor).build();

        sala = SalaChat.builder()
                .id(UUID.randomUUID())
                .comprador(comprador)
                .vendedor(vendedor)
                .anuncio(anuncio)
                .ativa(true)
                .atualizadaEm(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Deve criar sala com sucesso para anúncio")
    void deveCriarSalaComSucessoParaAnuncio() {
        RequisicaoCriarSala requisicao = new RequisicaoCriarSala(anuncioId, null);

        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));
        when(repositorioSalaChat.findByCompradorIdAndAnuncioId(compradorId, anuncioId)).thenReturn(Optional.empty());
        when(usuarioRepository.findById(compradorId)).thenReturn(Optional.of(comprador));
        when(usuarioRepository.findById(vendedorId)).thenReturn(Optional.of(vendedor));
        when(repositorioSalaChat.save(any(SalaChat.class))).thenReturn(sala);

        RespostaSalaChat resposta = servicoChat.obterOuCriarSala(compradorId, requisicao);

        assertThat(resposta).isNotNull();
        assertThat(resposta.anuncioId()).isEqualTo(anuncioId);
        verify(repositorioSalaChat, times(1)).save(any(SalaChat.class));
    }

    @Test
    @DisplayName("Deve retornar sala existente se já houver (idempotência)")
    void deveRetornarSalaExistenteSeHouver() {
        RequisicaoCriarSala requisicao = new RequisicaoCriarSala(anuncioId, null);

        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));
        when(repositorioSalaChat.findByCompradorIdAndAnuncioId(compradorId, anuncioId)).thenReturn(Optional.of(sala));

        RespostaSalaChat resposta = servicoChat.obterOuCriarSala(compradorId, requisicao);

        assertThat(resposta).isNotNull();
        assertThat(resposta.id()).isEqualTo(sala.getId());
        verify(repositorioSalaChat, never()).save(any(SalaChat.class));
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio se comprador for o próprio vendedor do anúncio")
    void deveLancarExcecaoSeCompradorForVendedor() {
        RequisicaoCriarSala requisicao = new RequisicaoCriarSala(anuncioId, null);

        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));

        assertThatThrownBy(() -> servicoChat.obterOuCriarSala(vendedorId, requisicao))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Vendedores não podem iniciar chat no próprio anúncio/veículo.");
    }

    @Test
    @DisplayName("Deve listar minhas salas com sucesso")
    void deveListarMinhasSalasComSucesso() {
        when(repositorioSalaChat.buscarSalasAtivasDoUsuario(compradorId)).thenReturn(List.of(sala));
        when(repositorioLeituraSala.findBySalaIdAndUsuarioId(sala.getId(), compradorId)).thenReturn(Optional.empty());
        when(repositorioSalaChat.contarNaoLidos(eq(sala.getId()), eq(compradorId), any(LocalDateTime.class))).thenReturn(5L);

        List<RespostaSalaChat> resposta = servicoChat.listarMinhasSalas(compradorId);

        assertThat(resposta).hasSize(1);
        assertThat(resposta.get(0).naoLidos()).isEqualTo(5L);
    }

    @Test
    @DisplayName("Deve lançar AccessDeniedException ao buscar sala por ID se usuário não for participante")
    void deveLancarErroSeUsuarioNaoForParticipante() {
        UUID estranhoId = UUID.randomUUID();
        when(repositorioSalaChat.findById(sala.getId())).thenReturn(Optional.of(sala));

        assertThatThrownBy(() -> servicoChat.buscarSalaPorId(sala.getId(), estranhoId))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Você não tem permissão para acessar esta conversa.");
    }

    @Test
    @DisplayName("Deve buscar mensagens com sucesso paginadas por cursor")
    void deveBuscarMensagensComSucesso() {
        MensagemChat m1 = MensagemChat.builder().id(UUID.randomUUID()).sala(sala).remetente(vendedor).conteudo("Oi").criadaEm(LocalDateTime.now()).build();
        RespostaMensagemChat m1Dto = new RespostaMensagemChat(m1.getId(), sala.getId(), vendedorId, "Oi", m1.getCriadaEm());

        when(repositorioSalaChat.findById(sala.getId())).thenReturn(Optional.of(sala));
        when(repositorioMensagemChat.buscarMensagensPorCursor(eq(sala.getId()), any(), any(), any(Pageable.class)))
                .thenReturn(List.of(m1));
        when(mapperChat.paraRespostaMensagem(m1)).thenReturn(m1Dto);

        RespostaCursorMensagens resposta = servicoChat.buscarMensagens(sala.getId(), compradorId, null);

        assertThat(resposta).isNotNull();
        assertThat(resposta.itens()).hasSize(1);
        assertThat(resposta.itens().get(0).conteudo()).isEqualTo("Oi");
        assertThat(resposta.proximoCursor()).isNull();
    }

    @Test
    @DisplayName("Deve enviar mensagem com sucesso e atualizar timestamp da sala")
    void deveEnviarMensagemComSucesso() {
        String conteudo = "Mensagem teste";
        MensagemChat m = MensagemChat.builder().id(UUID.randomUUID()).sala(sala).remetente(comprador).conteudo(conteudo).criadaEm(LocalDateTime.now()).build();
        RespostaMensagemChat mDto = new RespostaMensagemChat(m.getId(), sala.getId(), compradorId, conteudo, m.getCriadaEm());

        when(repositorioSalaChat.findById(sala.getId())).thenReturn(Optional.of(sala));
        when(usuarioRepository.findById(compradorId)).thenReturn(Optional.of(comprador));
        when(repositorioMensagemChat.save(any(MensagemChat.class))).thenReturn(m);
        when(mapperChat.paraRespostaMensagem(m)).thenReturn(mDto);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        RespostaMensagemChat resposta = servicoChat.enviarMensagem(sala.getId(), compradorId, conteudo);

        assertThat(resposta).isNotNull();
        assertThat(resposta.conteudo()).isEqualTo(conteudo);
        verify(repositorioSalaChat, times(1)).atualizarTimestamp(eq(sala.getId()), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Deve marcar mensagens da sala como lidas com sucesso")
    void deveMarcarComoLidoComSucesso() {
        when(repositorioSalaChat.findById(sala.getId())).thenReturn(Optional.of(sala));
        when(usuarioRepository.findById(compradorId)).thenReturn(Optional.of(comprador));
        when(repositorioLeituraSala.findBySalaIdAndUsuarioId(sala.getId(), compradorId)).thenReturn(Optional.empty());

        servicoChat.marcarComoLido(sala.getId(), compradorId);

        verify(repositorioLeituraSala, times(1)).save(any(LeituraSala.class));
    }
}
