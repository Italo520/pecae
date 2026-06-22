package com.pecae.api.autenticacao;

import com.pecae.api.autenticacao.dtos.LoginRequest;
import com.pecae.api.autenticacao.dtos.RegistroRequest;
import com.pecae.api.autenticacao.dtos.RespostaAutenticacao;
import com.pecae.api.autenticacao.entities.AceiteTermos;
import com.pecae.api.autenticacao.entities.TokenAtualizacao;
import com.pecae.api.autenticacao.entities.TokenVerificacaoEmail;
import com.pecae.api.autenticacao.mappers.IAutenticacaoMapper;
import com.pecae.api.autenticacao.repositories.AceiteTermosRepository;
import com.pecae.api.autenticacao.repositories.TokenAtualizacaoRepository;
import com.pecae.api.autenticacao.repositories.TokenRedefinicaoSenhaRepository;
import com.pecae.api.autenticacao.repositories.TokenVerificacaoEmailRepository;
import com.pecae.api.autenticacao.services.impl.AutenticacaoServiceImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.StatusUsuario;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import com.pecae.api.usuario.mappers.IUsuarioMapper;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.usuario.services.UsuarioService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do AutenticacaoService")
class AutenticacaoServiceTest {

    @Mock
    private UsuarioService usuarioService;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private TokenAtualizacaoRepository tokenAtualizacaoRepository;
    @Mock
    private TokenVerificacaoEmailRepository tokenVerificacaoEmailRepository;
    @Mock
    private TokenRedefinicaoSenhaRepository tokenRedefinicaoSenhaRepository;
    @Mock
    private AceiteTermosRepository aceiteTermosRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private ProvedorTokenJwt provedorTokenJwt;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private IAutenticacaoMapper autenticacaoMapper;
    @Mock
    private IUsuarioMapper usuarioMapper;

    @InjectMocks
    private AutenticacaoServiceImpl autenticacaoService;

    @BeforeEach
    void setUp() {
        // Define o tempo de expiração do refresh token via reflexão (pois é injetado do properties)
        ReflectionTestUtils.setField(autenticacaoService, "expiraRefreshMs", 604800000L);
    }

    @Nested
    @DisplayName("Testes de Registro")
    class TestesRegistro {

        @Test
        @DisplayName("Deve registrar um usuário comum com sucesso")
        void deveRegistrarUsuarioComSucesso() {
            RegistroRequest request = RegistroRequest.builder()
                    .nome("User Test")
                    .email("user@test.com")
                    .senha("password123")
                    .tipo(TipoUsuario.COMPRADOR)
                    .termosAceitos(true)
                    .build();

            Usuario usuario = Usuario.builder().id(UUID.randomUUID()).email("user@test.com").tipo(TipoUsuario.COMPRADOR).status(StatusUsuario.PENDENTE_VERIFICACAO).build();
            UsuarioResponse usuarioResponse = UsuarioResponse.builder().id(usuario.getId()).email("user@test.com").tipo(TipoUsuario.COMPRADOR).build();

            when(usuarioRepository.existsByEmail(request.getEmail())).thenReturn(false);
            when(autenticacaoMapper.toUsuario(request)).thenReturn(usuario);
            when(passwordEncoder.encode(request.getSenha())).thenReturn("encodedPassword");
            when(usuarioService.criarEntidade(usuario)).thenReturn(usuario);
            when(provedorTokenJwt.gerarToken(any(PrincipalUsuario.class))).thenReturn("access-token-123");
            when(usuarioMapper.toResponse(usuario)).thenReturn(usuarioResponse);

            RespostaAutenticacao resposta = autenticacaoService.registrar(request, "127.0.0.1", "Mozilla/5.0");

            assertThat(resposta).isNotNull();
            assertThat(resposta.getAccessToken()).isEqualTo("access-token-123");
            assertThat(resposta.getRefreshToken()).isNotNull();
            assertThat(resposta.getUsuario().getEmail()).isEqualTo("user@test.com");

            verify(aceiteTermosRepository, times(1)).save(any(AceiteTermos.class));
            verify(tokenVerificacaoEmailRepository, times(1)).save(any(TokenVerificacaoEmail.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio quando e-mail já estiver cadastrado")
        void deveLancarExcecaoQuandoEmailJaExistir() {
            RegistroRequest request = RegistroRequest.builder().email("exists@test.com").build();
            when(usuarioRepository.existsByEmail(request.getEmail())).thenReturn(true);

            assertThatThrownBy(() -> autenticacaoService.registrar(request, "127.0.0.1", "agent"))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("E-mail já está em uso");
        }
    }

    @Nested
    @DisplayName("Testes de Login")
    class TestesLogin {

        @Test
        @DisplayName("Deve efetuar login com sucesso")
        void deveEfetuarLoginComSucesso() {
            LoginRequest request = LoginRequest.builder().email("user@test.com").senha("password123").build();
            Usuario usuario = Usuario.builder()
                    .id(UUID.randomUUID())
                    .email("user@test.com")
                    .senhaHash("hashedPassword")
                    .emailVerificado(true)
                    .status(StatusUsuario.ATIVO)
                    .tipo(TipoUsuario.COMPRADOR)
                    .build();

            UsuarioResponse usuarioResponse = UsuarioResponse.builder().id(usuario.getId()).email("user@test.com").build();

            Authentication authentication = mock(Authentication.class);
            PrincipalUsuario principal = PrincipalUsuario.criar(usuario);
            when(authentication.getPrincipal()).thenReturn(principal);

            when(usuarioRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(usuario));
            when(passwordEncoder.matches(request.getSenha(), usuario.getSenhaHash())).thenReturn(true);
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
            when(provedorTokenJwt.gerarToken(principal)).thenReturn("accessToken");
            when(usuarioMapper.toResponse(usuario)).thenReturn(usuarioResponse);

            RespostaAutenticacao resposta = autenticacaoService.login(request, "127.0.0.1", "Mozilla");

            assertThat(resposta).isNotNull();
            assertThat(resposta.getAccessToken()).isEqualTo("accessToken");
            verify(usuarioRepository, times(1)).save(usuario); // atualiza ultimoAcessoEm
            verify(tokenAtualizacaoRepository, times(1)).save(any(TokenAtualizacao.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio (401) ao errar senha")
        void deveLancarExcecaoQuandoSenhaIncorreta() {
            LoginRequest request = LoginRequest.builder().email("user@test.com").senha("wrong").build();
            Usuario usuario = Usuario.builder().email("user@test.com").senhaHash("hashed").build();

            when(usuarioRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(usuario));
            when(passwordEncoder.matches(request.getSenha(), usuario.getSenhaHash())).thenReturn(false);

            assertThatThrownBy(() -> autenticacaoService.login(request, "127.0.0.1", "agent"))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Credenciais inválidas");
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio (401) quando e-mail não estiver verificado")
        void deveLancarExcecaoQuandoEmailNaoVerificado() {
            LoginRequest request = LoginRequest.builder().email("user@test.com").senha("password").build();
            Usuario usuario = Usuario.builder().email("user@test.com").senhaHash("hashed").emailVerificado(false).build();

            when(usuarioRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(usuario));
            when(passwordEncoder.matches(request.getSenha(), usuario.getSenhaHash())).thenReturn(true);

            assertThatThrownBy(() -> autenticacaoService.login(request, "127.0.0.1", "agent"))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("E-mail não verificado");
        }
    }

    @Nested
    @DisplayName("Testes de Verificação de E-mail")
    class TestesVerificacaoEmail {

        @Test
        @DisplayName("Deve verificar e-mail do usuário com sucesso")
        void deveVerificarEmailComSucesso() {
            String codigo = "123456";
            UUID usuarioId = UUID.randomUUID();
            TokenVerificacaoEmail token = TokenVerificacaoEmail.builder()
                    .usuarioId(usuarioId)
                    .expiraEm(LocalDateTime.now().plusDays(1))
                    .build();
            Usuario usuario = Usuario.builder().id(usuarioId).email("user@test.com").status(StatusUsuario.PENDENTE_VERIFICACAO).build();

            when(tokenVerificacaoEmailRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

            autenticacaoService.verificarEmail(codigo);

            assertThat(token.getUtilizadoEm()).isNotNull();
            assertThat(usuario.isEmailVerificado()).isTrue();
            assertThat(usuario.getStatus()).isEqualTo(StatusUsuario.ATIVO);
            verify(usuarioRepository, times(1)).save(usuario);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio quando token de verificação expirar")
        void deveLancarExcecaoQuandoTokenExpirar() {
            String codigo = "123456";
            TokenVerificacaoEmail token = TokenVerificacaoEmail.builder()
                    .expiraEm(LocalDateTime.now().minusMinutes(1))
                    .build();

            when(tokenVerificacaoEmailRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

            assertThatThrownBy(() -> autenticacaoService.verificarEmail(codigo))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Código inválido ou expirado");
        }
    }
}
