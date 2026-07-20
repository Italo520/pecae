package com.pecae.api.vendedor.services;

import com.pecae.api.vendedor.dtos.*;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.entities.EstatisticasVendedor;
import com.pecae.api.vendedor.entities.VerificacaoVendedor;
import com.pecae.api.vendedor.entities.enums.TipoVendedor;
import com.pecae.api.vendedor.entities.enums.StatusVerificacao;
import com.pecae.api.vendedor.mappers.IVendedorMapper;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import com.pecae.api.vendedor.repositories.EstatisticasVendedorRepository;
import com.pecae.api.vendedor.repositories.VerificacaoVendedorRepository;
import com.pecae.api.vendedor.services.impl.VendedorServiceImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
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
@DisplayName("Testes do VendedorService")
class VendedorServiceTest {

    @Mock
    private PerfilVendedorRepository perfilVendedorRepository;

    @Mock
    private EstatisticasVendedorRepository estatisticasVendedorRepository;

    @Mock
    private VerificacaoVendedorRepository verificacaoVendedorRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private IVendedorMapper vendedorMapper;

    @Mock
    private EstatisticasVendedorService estatisticasVendedorService;

    @InjectMocks
    private VendedorServiceImpl vendedorService;

    @Nested
    @DisplayName("Testes de Criação de Perfil")
    class TestesCriarPerfil {

        @Test
        @DisplayName("Deve criar perfil com sucesso")
        void deveCriarPerfilComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            CriarVendedorRequest request = new CriarVendedorRequest("Seller Name", "12345678901", "11999999999", TipoVendedor.CONCESSIONARIA);
            Usuario usuario = Usuario.builder().id(usuarioId).email("seller@test.com").build();
            PerfilVendedor perfil = PerfilVendedor.builder().nome("Seller Name").documento("12345678901").telefone("11999999999").tipoVendedor(TipoVendedor.CONCESSIONARIA).build();
            PerfilVendedor perfilSalvo = PerfilVendedor.builder().id(UUID.randomUUID()).usuario(usuario).nome("Seller Name").documento("12345678901").telefone("11999999999").tipoVendedor(TipoVendedor.CONCESSIONARIA).build();

            when(perfilVendedorRepository.existsByUsuarioId(usuarioId)).thenReturn(false);
            when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
            when(vendedorMapper.toEntity(request)).thenReturn(perfil);
            when(perfilVendedorRepository.save(perfil)).thenReturn(perfilSalvo);

            RespostaPerfilVendedor respostaEsperada = new RespostaPerfilVendedor(
                    perfilSalvo.getId(), usuarioId, "Seller Name", "12345678901", "11999999999",
                    null, null, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
            );

            when(vendedorMapper.toResponseWithDetails(eq(perfilSalvo), any(), any())).thenReturn(respostaEsperada);

            RespostaPerfilVendedor resultado = vendedorService.criarPerfil(usuarioId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.nome()).isEqualTo("Seller Name");
            verify(estatisticasVendedorService, times(1)).inicializarEstatisticas(perfilSalvo);
            verify(perfilVendedorRepository, times(1)).save(perfil);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se perfil de vendedor já existir")
        void deveLancarExcecaoQuandoPerfilJaExistir() {
            UUID usuarioId = UUID.randomUUID();
            CriarVendedorRequest request = new CriarVendedorRequest("Seller Name", "12345678901", "11999999999", TipoVendedor.CONCESSIONARIA);

            when(perfilVendedorRepository.existsByUsuarioId(usuarioId)).thenReturn(true);

            assertThatThrownBy(() -> vendedorService.criarPerfil(usuarioId, request))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("já possui um perfil de vendedor");
        }
    }

    @Nested
    @DisplayName("Testes de Atualização de Perfil")
    class TestesAtualizarPerfil {

        @Test
        @DisplayName("Deve atualizar perfil com sucesso")
        void deveAtualizarPerfilComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            AtualizarVendedorRequest request = new AtualizarVendedorRequest("New Name", "11988888888", "New bio");
            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).nome("Old Name").build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(perfilVendedorRepository.save(perfil)).thenReturn(perfil);

            RespostaPerfilVendedor respostaEsperada = new RespostaPerfilVendedor(
                    perfil.getId(), usuarioId, "New Name", "12345678901", "11988888888",
                    "New bio", null, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
            );
            when(vendedorMapper.toResponseWithDetails(eq(perfil), any(), any())).thenReturn(respostaEsperada);

            RespostaPerfilVendedor resultado = vendedorService.atualizarPerfil(usuarioId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.nome()).isEqualTo("New Name");
            verify(vendedorMapper, times(1)).updateEntityFromDto(request, perfil);
            verify(perfilVendedorRepository, times(1)).save(perfil);
        }
    }

    @Nested
    @DisplayName("Testes de Verificação de Conta")
    class TestesVerificacao {

        @Test
        @DisplayName("Deve solicitar verificação com sucesso quando não existir solicitação anterior")
        void deveSolicitarVerificacaoComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).nome("Seller Name").build();
            VerificacaoVendedor verificacao = VerificacaoVendedor.builder().perfilVendedor(perfil).status(StatusVerificacao.PENDENTE).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())).thenReturn(Optional.empty());
            when(verificacaoVendedorRepository.save(any(VerificacaoVendedor.class))).thenReturn(verificacao);

            RespostaVerificacaoVendedor respostaEsperada = new RespostaVerificacaoVendedor(
                    UUID.randomUUID(), StatusVerificacao.PENDENTE, java.time.LocalDateTime.now(), null, null
            );
            when(vendedorMapper.toVerificationResponse(verificacao)).thenReturn(respostaEsperada);

            RespostaVerificacaoVendedor resultado = vendedorService.solicitarVerificacao(usuarioId);

            assertThat(resultado).isNotNull();
            assertThat(resultado.status()).isEqualTo(StatusVerificacao.PENDENTE);
            verify(verificacaoVendedorRepository, times(1)).save(any(VerificacaoVendedor.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se verificação estiver pendente ou aprovada")
        void deveLancarExcecaoQuandoVerificacaoJaPendenteOuAprovada() {
            UUID usuarioId = UUID.randomUUID();
            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).nome("Seller Name").build();
            VerificacaoVendedor existente = VerificacaoVendedor.builder().status(StatusVerificacao.PENDENTE).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())).thenReturn(Optional.of(existente));

            assertThatThrownBy(() -> vendedorService.solicitarVerificacao(usuarioId))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("já está pendente ou já foi aprovada");
        }
    }

    @Nested
    @DisplayName("Testes de Mídia")
    class TestesMidia {

        @Test
        @DisplayName("Deve atualizar logo com sucesso")
        void deveAtualizarLogoComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).nome("Seller Name").build();
            String urlLogo = "http://fake-logo-url.png";

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(perfilVendedorRepository.save(perfil)).thenReturn(perfil);

            RespostaPerfilVendedor respostaEsperada = new RespostaPerfilVendedor(
                    perfil.getId(), usuarioId, "Seller Name", "12345678901", "11999999999",
                    null, urlLogo, null, TipoVendedor.CONCESSIONARIA, null, null, null, null
            );
            when(vendedorMapper.toResponseWithDetails(eq(perfil), any(), any())).thenReturn(respostaEsperada);

            RespostaPerfilVendedor resultado = vendedorService.atualizarLogo(usuarioId, urlLogo);

            assertThat(resultado.urlLogo()).isEqualTo(urlLogo);
            assertThat(perfil.getUrlLogo()).isEqualTo(urlLogo);
        }
    }

    @Nested
    @DisplayName("Testes de Exclusão de Perfil")
    class TestesExcluirPerfil {

        @Test
        @DisplayName("Deve deletar perfil e seus dados filhas com sucesso")
        void deveExcluirPerfilEDadosFilhosComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).nome("Seller Name").build();
            EstatisticasVendedor stats = EstatisticasVendedor.builder().id(UUID.randomUUID()).build();
            VerificacaoVendedor verificacao = VerificacaoVendedor.builder().id(UUID.randomUUID()).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(estatisticasVendedorRepository.findByPerfilVendedorId(perfil.getId())).thenReturn(Optional.of(stats));
            when(verificacaoVendedorRepository.findByPerfilVendedorId(perfil.getId())).thenReturn(Optional.of(verificacao));

            vendedorService.excluirPerfil(usuarioId);

            verify(estatisticasVendedorRepository, times(1)).delete(stats);
            verify(verificacaoVendedorRepository, times(1)).delete(verificacao);
            verify(perfilVendedorRepository, times(1)).delete(perfil);
        }
    }
}
