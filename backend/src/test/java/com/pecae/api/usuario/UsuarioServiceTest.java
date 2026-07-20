package com.pecae.api.usuario;

import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.dtos.AtualizarUsuarioRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.TokenPush;
import com.pecae.api.usuario.entities.enums.PlataformaPush;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.mappers.IUsuarioMapper;
import com.pecae.api.usuario.repositories.TokenPushRepository;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.usuario.services.impl.UsuarioServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do UsuarioService")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private TokenPushRepository tokenPushRepository;

    @Mock
    private IUsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioServiceImpl usuarioService;

    @Nested
    @DisplayName("Testes de Busca de Usuário")
    class TestesBuscaUsuario {

        @Test
        @DisplayName("Deve buscar entidade Usuario por ID com sucesso")
        void deveBuscarEntidadePorIdComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("usuario@test.com").build();
            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

            Usuario resultado = usuarioService.buscarEntidadePorId(usuarioId);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getId()).isEqualTo(usuarioId);
            verify(usuarioRepository, times(1)).findById(usuarioId);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando ID de usuário não existir")
        void deveLancarExcecaoQuandoUsuarioNaoEncontrado() {
            UUID usuarioId = UUID.randomUUID();
            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> usuarioService.buscarEntidadePorId(usuarioId))
                    .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                    .hasMessageContaining("Usuário não encontrado");
        }
    }

    @Nested
    @DisplayName("Testes de Atualização de Usuário")
    class TestesAtualizacaoUsuario {

        @Test
        @DisplayName("Deve atualizar perfil com sucesso")
        void deveAtualizarUsuarioComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).nome("Nome Antigo").telefone("+5511999999999").build();
            AtualizarUsuarioRequest request = AtualizarUsuarioRequest.builder().nome("Novo Nome").telefone("+5511999999999").build();

            UsuarioResponse respostaEsperada = UsuarioResponse.builder().id(usuarioId).nome("Novo Nome").telefone("+5511999999999").build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);
            when(usuarioMapper.toResponse(any(Usuario.class))).thenReturn(respostaEsperada);

            UsuarioResponse resultado = usuarioService.atualizarUsuario(usuarioId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getNome()).isEqualTo("Novo Nome");
            verify(usuarioMapper, times(1)).updateEntity(request, usuario);
            verify(usuarioRepository, times(1)).save(usuario);
        }

        @Test
        @DisplayName("Deve lançar IllegalArgumentException quando atualizar telefone para um já existente")
        void deveLancarExcecaoQuandoTelefoneJaEstiverEmUso() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).nome("Usuário").telefone("+5511999999999").build();
            AtualizarUsuarioRequest request = AtualizarUsuarioRequest.builder().telefone("+5511888888888").build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(usuarioRepository.existsByTelefone("+5511888888888")).thenReturn(true);

            assertThatThrownBy(() -> usuarioService.atualizarUsuario(usuarioId, request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Telefone já está em uso");
        }
    }

    @Nested
    @DisplayName("Testes de Push Token")
    class TestesPushToken {

        @Test
        @DisplayName("Deve salvar novo push token com sucesso")
        void deveSalvarNovoTokenPushComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            String token = "expo-token-123";
            PlataformaPush plataforma = PlataformaPush.ANDROID;

            when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
            when(tokenPushRepository.findByUsuarioIdAndPlataforma(usuarioId, plataforma)).thenReturn(Optional.empty());

            usuarioService.salvarTokenPush(usuarioId, token, plataforma);

            verify(tokenPushRepository, times(1)).save(any(TokenPush.class));
        }

        @Test
        @DisplayName("Deve atualizar push token existente com sucesso")
        void deveAtualizarTokenPushExistenteComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            String token = "novo-expo-token";
            PlataformaPush plataforma = PlataformaPush.IOS;
            TokenPush tokenExistente = TokenPush.builder().usuarioId(usuarioId).token("old-token").plataforma(plataforma).build();

            when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
            when(tokenPushRepository.findByUsuarioIdAndPlataforma(usuarioId, plataforma)).thenReturn(Optional.of(tokenExistente));

            usuarioService.salvarTokenPush(usuarioId, token, plataforma);

            assertThat(tokenExistente.getToken()).isEqualTo(token);
            verify(tokenPushRepository, times(1)).save(tokenExistente);
        }
    }
}
