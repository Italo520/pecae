package com.pecae.api.notificacao.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.notificacao.dtos.request.RegistrarTokenPushRequest;
import com.pecae.api.notificacao.dtos.response.RespostaNotificacao;
import com.pecae.api.notificacao.entities.Notificacao;
import com.pecae.api.usuario.entities.TokenPush;
import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import com.pecae.api.notificacao.jobs.JobEnvioNotificacao;
import com.pecae.api.notificacao.mappers.MapperNotificacao;
import com.pecae.api.notificacao.repositories.RepositorioNotificacao;
import com.pecae.api.notificacao.repositories.RepositorioTokenPush;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoNotificacaoImpl")
class ServicoNotificacaoImplTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RepositorioNotificacao repositorioNotificacao;

    @Mock
    private RepositorioTokenPush repositorioTokenPush;

    @Mock
    private JobEnvioNotificacao jobEnvioNotificacao;

    @Mock
    private MapperNotificacao mapperNotificacao;

    @InjectMocks
    private ServicoNotificacaoImpl servicoNotificacao;

    @Test
    @DisplayName("Deve registrar um novo token push com sucesso")
    void deveRegistrarNovoTokenPush() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        RegistrarTokenPushRequest request = new RegistrarTokenPushRequest("token-novo-123", "iPhone 15");

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioTokenPush.findByToken(request.getToken())).thenReturn(Optional.empty());

        servicoNotificacao.registrarTokenPush(usuarioId, request);

        verify(repositorioTokenPush, times(1)).save(any(TokenPush.class));
    }

    @Test
    @DisplayName("Deve atualizar info do dispositivo se o token pertence ao mesmo usuario")
    void deveAtualizarTokenExistenteDoMesmoUsuario() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        RegistrarTokenPushRequest request = new RegistrarTokenPushRequest("token-existente", "Android");
        TokenPush tokenPush = TokenPush.builder().id(UUID.randomUUID()).usuario(usuario).token("token-existente").build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioTokenPush.findByToken(request.getToken())).thenReturn(Optional.of(tokenPush));

        servicoNotificacao.registrarTokenPush(usuarioId, request);

        assertThat(tokenPush.getInfoDispositivo()).isEqualTo("Android");
        verify(repositorioTokenPush, times(1)).save(tokenPush);
    }

    @Test
    @DisplayName("Deve reassociar o token ao novo usuario se o dispositivo mudou de dono")
    void deveReassociarTokenParaNovoUsuario() {
        UUID usuarioAntigoId = UUID.randomUUID();
        UUID usuarioNovoId = UUID.randomUUID();
        Usuario usuarioAntigo = Usuario.builder().id(usuarioAntigoId).build();
        Usuario usuarioNovo = Usuario.builder().id(usuarioNovoId).build();

        RegistrarTokenPushRequest request = new RegistrarTokenPushRequest("token-trocado", "Android");
        TokenPush tokenPush = TokenPush.builder().id(UUID.randomUUID()).usuario(usuarioAntigo).token("token-trocado").build();

        when(usuarioRepository.findById(usuarioNovoId)).thenReturn(Optional.of(usuarioNovo));
        when(repositorioTokenPush.findByToken(request.getToken())).thenReturn(Optional.of(tokenPush));

        servicoNotificacao.registrarTokenPush(usuarioNovoId, request);

        assertThat(tokenPush.getUsuario().getId()).isEqualTo(usuarioNovoId);
        assertThat(tokenPush.getInfoDispositivo()).isEqualTo("Android");
        verify(repositorioTokenPush, times(1)).save(tokenPush);
    }

    @Test
    @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando registrar token para usuario inexistente")
    void deveLancarExcecaoUsuarioNaoEncontradoNoRegistroToken() {
        UUID usuarioId = UUID.randomUUID();
        RegistrarTokenPushRequest request = new RegistrarTokenPushRequest("token-novo-123", "iPhone 15");

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicoNotificacao.registrarTokenPush(usuarioId, request))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class);

        verify(repositorioTokenPush, never()).save(any());
    }

    @Test
    @DisplayName("Deve remover token push existente")
    void deveRemoverTokenPushExistente() {
        String token = "token-remover";
        TokenPush tokenPush = TokenPush.builder().id(UUID.randomUUID()).token(token).build();

        when(repositorioTokenPush.findByToken(token)).thenReturn(Optional.of(tokenPush));

        servicoNotificacao.removerTokenPush(token);

        verify(repositorioTokenPush, times(1)).delete(tokenPush);
    }

    @Test
    @DisplayName("Deve ignorar deleção se token push não for encontrado")
    void deveIgnorarRemocaoDeTokenInexistente() {
        String token = "token-inexistente";
        when(repositorioTokenPush.findByToken(token)).thenReturn(Optional.empty());

        servicoNotificacao.removerTokenPush(token);

        verify(repositorioTokenPush, never()).delete(any());
    }

    @Test
    @DisplayName("Deve listar notificações do usuário paginado")
    void deveListarNotificacoesDoUsuario() {
        UUID usuarioId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Notificacao notificacao = Notificacao.builder().id(UUID.randomUUID()).titulo("Aviso").build();
        Page<Notificacao> pagina = new PageImpl<>(List.of(notificacao), pageable, 1);

        RespostaNotificacao respostaDto = RespostaNotificacao.builder().id(notificacao.getId()).titulo("Aviso").build();

        when(repositorioNotificacao.findByUsuarioId(usuarioId, pageable)).thenReturn(pagina);
        when(mapperNotificacao.paraRespostaNotificacao(notificacao)).thenReturn(respostaDto);

        Page<RespostaNotificacao> resultado = servicoNotificacao.listarNotificacoes(usuarioId, pageable);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).getTitulo()).isEqualTo("Aviso");
    }

    @Test
    @DisplayName("Deve marcar notificação como lida com sucesso")
    void deveMarcarComoLidaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        UUID notificacaoId = UUID.randomUUID();
        Notificacao notificacao = Notificacao.builder().id(notificacaoId).usuario(usuario).lida(false).build();

        when(repositorioNotificacao.findById(notificacaoId)).thenReturn(Optional.of(notificacao));

        servicoNotificacao.marcarComoLida(notificacaoId, usuarioId);

        assertThat(notificacao.getLida()).isTrue();
        verify(repositorioNotificacao, times(1)).save(notificacao);
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio (FORBIDDEN) se notificação pertence a outro usuário")
    void deveLancarExcecaoSeUsuarioNaoForDonoDaNotificacao() {
        UUID usuarioId = UUID.randomUUID();
        UUID donoId = UUID.randomUUID();
        Usuario dono = Usuario.builder().id(donoId).build();
        UUID notificacaoId = UUID.randomUUID();
        Notificacao notificacao = Notificacao.builder().id(notificacaoId).usuario(dono).lida(false).build();

        when(repositorioNotificacao.findById(notificacaoId)).thenReturn(Optional.of(notificacao));

        assertThatThrownBy(() -> servicoNotificacao.marcarComoLida(notificacaoId, usuarioId))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN);

        verify(repositorioNotificacao, never()).save(any());
    }

    @Test
    @DisplayName("Deve disparar o job assíncrono ao despachar notificação")
    void deveDispararJobAoDespacharNotificacao() {
        UUID usuarioId = UUID.randomUUID();
        Set<CanalNotificacao> canais = Set.of(CanalNotificacao.APP, CanalNotificacao.PUSH);

        servicoNotificacao.despacharNotificacao(usuarioId, "Titulo", "Corpo", TipoNotificacao.ALERTA_SISTEMA, "url", canais);

        verify(jobEnvioNotificacao, times(1)).executar(usuarioId, "Titulo", "Corpo", TipoNotificacao.ALERTA_SISTEMA, "url", canais);
    }
}
