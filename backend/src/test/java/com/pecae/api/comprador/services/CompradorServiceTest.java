package com.pecae.api.comprador.services;

import com.pecae.api.autenticacao.entities.TokenAtualizacao;
import com.pecae.api.autenticacao.repositories.TokenAtualizacaoRepository;
import com.pecae.api.comprador.dtos.*;
import com.pecae.api.comprador.entities.PerfilComprador;
import com.pecae.api.comprador.entities.PreferenciasNotificacao;
import com.pecae.api.comprador.mappers.ICompradorMapper;
import com.pecae.api.comprador.repositories.PerfilCompradorRepository;
import com.pecae.api.comprador.repositories.PreferenciasNotificacaoRepository;
import com.pecae.api.comprador.services.impl.CompradorServiceImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.StatusUsuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do CompradorService")
class CompradorServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilCompradorRepository perfilCompradorRepository;

    @Mock
    private PreferenciasNotificacaoRepository preferenciasNotificacaoRepository;

    @Mock
    private TokenAtualizacaoRepository tokenAtualizacaoRepository;

    @Mock
    private ICompradorMapper compradorMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EntityManager entityManager;

    @Mock
    private Query query;

    @InjectMocks
    private CompradorServiceImpl compradorService;

    @Nested
    @DisplayName("Testes de Busca de Perfil")
    class TestesObterPerfil {

        @Test
        @DisplayName("Deve retornar perfil completo com sucesso")
        void deveRetornarPerfilCompletoComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("buyer@test.com").nome("Buyer User").build();
            PerfilComprador perfil = PerfilComprador.builder().usuario(usuario).nome("Buyer User").build();
            PreferenciasNotificacao preferencias = PreferenciasNotificacao.builder().usuario(usuario).pushHabilitado(true).build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(perfilCompradorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(preferenciasNotificacaoRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(preferencias));

            RespostaPerfilComprador perfilResposta = RespostaPerfilComprador.builder().usuarioId(usuarioId).nome("Buyer User").build();
            RespostaPreferenciasNotificacao preferenciasResposta = RespostaPreferenciasNotificacao.builder().usuarioId(usuarioId).pushHabilitado(true).build();

            when(compradorMapper.toResponse(perfil)).thenReturn(perfilResposta);
            when(compradorMapper.toResponse(preferencias)).thenReturn(preferenciasResposta);

            RespostaCompradorMe resultado = compradorService.obterPerfilPorUsuarioId(usuarioId);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getEmail()).isEqualTo("buyer@test.com");
            assertThat(resultado.getPerfilComprador().getNome()).isEqualTo("Buyer User");
            assertThat(resultado.getPreferenciasNotificacao().isPushHabilitado()).isTrue();
        }

        @Test
        @DisplayName("Deve criar perfil e preferências sob demanda se não existirent")
        void deveCriarPerfilEPreferenciasSobDemanda() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("buyer@test.com").nome("Buyer User").build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(perfilCompradorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());
            when(preferenciasNotificacaoRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.empty());

            PerfilComprador perfilMockSalvo = PerfilComprador.builder().usuario(usuario).nome("Buyer User").build();
            PreferenciasNotificacao preferenciasMockSalvo = PreferenciasNotificacao.builder().usuario(usuario).build();

            when(perfilCompradorRepository.save(any(PerfilComprador.class))).thenReturn(perfilMockSalvo);
            when(preferenciasNotificacaoRepository.save(any(PreferenciasNotificacao.class))).thenReturn(preferenciasMockSalvo);

            compradorService.obterPerfilPorUsuarioId(usuarioId);

            verify(perfilCompradorRepository, times(1)).save(any(PerfilComprador.class));
            verify(preferenciasNotificacaoRepository, times(1)).save(any(PreferenciasNotificacao.class));
        }
    }

    @Nested
    @DisplayName("Testes de Atualização de Perfil")
    class TestesAtualizarPerfil {

        @Test
        @DisplayName("Deve atualizar perfil e preferências com sucesso")
        void deveAtualizarPerfilComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("buyer@test.com").nome("Old Name").build();
            PerfilComprador perfil = PerfilComprador.builder().usuario(usuario).nome("Old Name").build();
            PreferenciasNotificacao preferencias = PreferenciasNotificacao.builder().usuario(usuario).pushHabilitado(true).build();

            AtualizarPreferenciasNotificacaoRequest atualizarPrefsReq = AtualizarPreferenciasNotificacaoRequest.builder().push(false).build();
            AtualizarCompradorRequest request = AtualizarCompradorRequest.builder()
                    .nome("New Name")
                    .preferenciasNotificacao(atualizarPrefsReq)
                    .build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(perfilCompradorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(preferenciasNotificacaoRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(preferencias));

            compradorService.atualizarPerfil(usuarioId, request);

            assertThat(usuario.getNome()).isEqualTo("New Name");
            assertThat(perfil.getNome()).isEqualTo("New Name");

            verify(compradorMapper, times(1)).updateEntity(request, perfil);
            verify(compradorMapper, times(1)).updateEntity(atualizarPrefsReq, preferencias);
            verify(usuarioRepository, times(1)).save(usuario);
            verify(perfilCompradorRepository, times(1)).save(perfil);
            verify(preferenciasNotificacaoRepository, times(1)).save(preferencias);
        }
    }

    @Nested
    @DisplayName("Testes de Exclusão de Conta")
    class TestesExcluirConta {

        @Test
        @DisplayName("Deve excluir conta com sucesso")
        void deveExcluirContaComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("buyer@test.com").senhaHash("hashed-password").status(StatusUsuario.ATIVO).build();
            PerfilComprador perfil = PerfilComprador.builder().usuario(usuario).build();
            ExcluirContaRequest request = ExcluirContaRequest.builder().senhaAtual("plain-password").build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(passwordEncoder.matches("plain-password", "hashed-password")).thenReturn(true);
            when(perfilCompradorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(tokenAtualizacaoRepository.findByUsuarioIdAndRevogadoEmIsNull(usuarioId)).thenReturn(Collections.emptyList());

            // Mock de consultas SQL nativas do entityManager
            when(entityManager.createNativeQuery(anyString())).thenReturn(query);
            when(query.setParameter(anyString(), any())).thenReturn(query);
            when(query.executeUpdate()).thenReturn(1);

            compradorService.excluirConta(usuarioId, request);

            assertThat(usuario.getStatus()).isEqualTo(StatusUsuario.DELETADO);
            assertThat(usuario.getDeletadoEm()).isNotNull();
            assertThat(perfil.getDeletadoEm()).isNotNull();

            verify(usuarioRepository, times(1)).save(usuario);
            verify(perfilCompradorRepository, times(1)).save(perfil);
            verify(entityManager, times(3)).createNativeQuery(anyString());
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio (401) ao tentar excluir com senha incorreta")
        void deveLancarExcecaoQuandoSenhaIncorreta() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("buyer@test.com").senhaHash("hashed-password").status(StatusUsuario.ATIVO).build();
            ExcluirContaRequest request = ExcluirContaRequest.builder().senhaAtual("wrong-password").build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

            assertThatThrownBy(() -> compradorService.excluirConta(usuarioId, request))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED)
                    .hasMessageContaining("Senha atual incorreta");
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio (401) se conta já estiver excluída")
        void deveLancarExcecaoQuandoContaJaExcluida() {
            UUID usuarioId = UUID.randomUUID();
            Usuario usuario = Usuario.builder().id(usuarioId).email("buyer@test.com").status(StatusUsuario.DELETADO).build();
            ExcluirContaRequest request = ExcluirContaRequest.builder().senhaAtual("any").build();

            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

            assertThatThrownBy(() -> compradorService.excluirConta(usuarioId, request))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasFieldOrPropertyWithValue("status", HttpStatus.UNAUTHORIZED)
                    .hasMessageContaining("A conta já foi excluída");
        }
    }
}
