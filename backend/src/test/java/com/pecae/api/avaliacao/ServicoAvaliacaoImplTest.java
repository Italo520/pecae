package com.pecae.api.avaliacao;

import com.pecae.api.avaliacao.dtos.request.CriarAvaliacaoRequest;
import com.pecae.api.avaliacao.dtos.response.RespostaAvaliacao;
import com.pecae.api.avaliacao.entities.Avaliacao;
import com.pecae.api.avaliacao.jobs.JobRecalculoAvaliacao;
import com.pecae.api.avaliacao.mappers.MapperAvaliacao;
import com.pecae.api.avaliacao.repositories.AvaliacaoRepository;
import com.pecae.api.avaliacao.services.impl.ServicoAvaliacaoImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoAvaliacaoImpl")
class ServicoAvaliacaoImplTest {

    @Mock
    private AvaliacaoRepository avaliacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PerfilVendedorRepository perfilVendedorRepository;

    @Mock
    private JobRecalculoAvaliacao jobRecalculoAvaliacao;

    @Mock
    private MapperAvaliacao mapper;

    @InjectMocks
    private ServicoAvaliacaoImpl servicoAvaliacao;

    @Nested
    @DisplayName("Testes de Submissão de Avaliação")
    class TestesSubmissao {

        @Test
        @DisplayName("Deve criar avaliação e acionar recálculo com sucesso")
        void deveCriarAvaliacaoComSucesso() {
            UUID avaliadorId = UUID.randomUUID();
            UUID vendedorId = UUID.randomUUID();
            UUID usuarioVendedorId = UUID.randomUUID();

            Usuario avaliador = Usuario.builder().id(avaliadorId).nome("Comprador").build();
            Usuario usuarioVendedor = Usuario.builder().id(usuarioVendedorId).nome("Dono da Loja").build();
            PerfilVendedor vendedor = PerfilVendedor.builder().id(vendedorId).usuario(usuarioVendedor).build();

            CriarAvaliacaoRequest request = new CriarAvaliacaoRequest(vendedorId, 5, "Excelente!");
            
            Avaliacao avaliacaoSalva = Avaliacao.builder()
                    .id(UUID.randomUUID())
                    .avaliador(avaliador)
                    .vendedor(vendedor)
                    .nota(5)
                    .comentario("Excelente!")
                    .deletada(false)
                    .criadaEm(LocalDateTime.now())
                    .atualizadaEm(LocalDateTime.now())
                    .build();

            RespostaAvaliacao respostaEsperada = new RespostaAvaliacao(
                    avaliacaoSalva.getId(), vendedorId, avaliadorId, "Comprador", 5, "Excelente!",
                    avaliacaoSalva.getCriadaEm(), avaliacaoSalva.getAtualizadaEm()
            );

            when(usuarioRepository.findById(avaliadorId)).thenReturn(Optional.of(avaliador));
            when(perfilVendedorRepository.findById(vendedorId)).thenReturn(Optional.of(vendedor));
            when(avaliacaoRepository.findByAvaliadorIdAndVendedorId(avaliadorId, vendedorId)).thenReturn(Optional.empty());
            when(avaliacaoRepository.save(any(Avaliacao.class))).thenReturn(avaliacaoSalva);
            when(mapper.paraResposta(any(Avaliacao.class))).thenReturn(respostaEsperada);

            RespostaAvaliacao resultado = servicoAvaliacao.submeterAvaliacao(avaliadorId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.nota()).isEqualTo(5);
            assertThat(resultado.comentario()).isEqualTo("Excelente!");
            verify(avaliacaoRepository, times(1)).save(any(Avaliacao.class));
            verify(jobRecalculoAvaliacao, times(1)).recalcularEstatisticasAsync(vendedorId);
        }

        @Test
        @DisplayName("Deve atualizar avaliação existente se já houver uma ativa para o vendedor")
        void deveAtualizarAvaliacaoExistenteComSucesso() {
            UUID avaliadorId = UUID.randomUUID();
            UUID vendedorId = UUID.randomUUID();
            UUID usuarioVendedorId = UUID.randomUUID();

            Usuario avaliador = Usuario.builder().id(avaliadorId).nome("Comprador").build();
            Usuario usuarioVendedor = Usuario.builder().id(usuarioVendedorId).nome("Dono da Loja").build();
            PerfilVendedor vendedor = PerfilVendedor.builder().id(vendedorId).usuario(usuarioVendedor).build();

            CriarAvaliacaoRequest request = new CriarAvaliacaoRequest(vendedorId, 4, "Atualizado");
            
            Avaliacao avaliacaoExistente = Avaliacao.builder()
                    .id(UUID.randomUUID())
                    .avaliador(avaliador)
                    .vendedor(vendedor)
                    .nota(3)
                    .comentario("Antigo")
                    .deletada(false)
                    .build();

            when(usuarioRepository.findById(avaliadorId)).thenReturn(Optional.of(avaliador));
            when(perfilVendedorRepository.findById(vendedorId)).thenReturn(Optional.of(vendedor));
            when(avaliacaoRepository.findByAvaliadorIdAndVendedorId(avaliadorId, vendedorId)).thenReturn(Optional.of(avaliacaoExistente));
            when(avaliacaoRepository.save(any(Avaliacao.class))).thenAnswer(invocation -> invocation.getArgument(0));

            servicoAvaliacao.submeterAvaliacao(avaliadorId, request);

            assertThat(avaliacaoExistente.getNota()).isEqualTo(4);
            assertThat(avaliacaoExistente.getComentario()).isEqualTo("Atualizado");
            verify(avaliacaoRepository, times(1)).save(avaliacaoExistente);
            verify(jobRecalculoAvaliacao, times(1)).recalcularEstatisticasAsync(vendedorId);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio quando usuário tentar avaliar a si mesmo")
        void deveLancarExcecaoQuandoAvaliarASiMesmo() {
            UUID avaliadorId = UUID.randomUUID();
            UUID vendedorId = UUID.randomUUID();

            Usuario avaliador = Usuario.builder().id(avaliadorId).nome("Comprador e Vendedor").build();
            PerfilVendedor vendedor = PerfilVendedor.builder().id(vendedorId).usuario(avaliador).build();

            CriarAvaliacaoRequest request = new CriarAvaliacaoRequest(vendedorId, 5, "Autoavaliação");

            when(usuarioRepository.findById(avaliadorId)).thenReturn(Optional.of(avaliador));
            when(perfilVendedorRepository.findById(vendedorId)).thenReturn(Optional.of(vendedor));

            assertThatThrownBy(() -> servicoAvaliacao.submeterAvaliacao(avaliadorId, request))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Você não pode avaliar o seu próprio perfil de vendedor");

            verify(avaliacaoRepository, never()).save(any(Avaliacao.class));
            verify(jobRecalculoAvaliacao, never()).recalcularEstatisticasAsync(any(UUID.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando avaliador não existir")
        void deveLancarExcecaoQuandoAvaliadorNaoExistir() {
            UUID avaliadorId = UUID.randomUUID();
            CriarAvaliacaoRequest request = new CriarAvaliacaoRequest(UUID.randomUUID(), 5, "Comentário");

            when(usuarioRepository.findById(avaliadorId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> servicoAvaliacao.submeterAvaliacao(avaliadorId, request))
                    .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                    .hasMessageContaining("Avaliador não encontrado");
        }
    }

    @Nested
    @DisplayName("Testes de Listagem de Avaliações")
    class TestesListagem {

        @Test
        @DisplayName("Deve listar avaliações do vendedor paginadas com sucesso")
        void deveListarAvaliacoesDoVendedorComSucesso() {
            UUID vendedorId = UUID.randomUUID();
            Pageable pageable = PageRequest.of(0, 10);
            
            Avaliacao avaliacao = Avaliacao.builder()
                    .id(UUID.randomUUID())
                    .nota(5)
                    .comentario("Bom")
                    .build();

            Page<Avaliacao> paginaEntidade = new PageImpl<>(List.of(avaliacao), pageable, 1);
            
            RespostaAvaliacao resposta = new RespostaAvaliacao(
                    avaliacao.getId(), vendedorId, UUID.randomUUID(), "Comprador", 5, "Bom",
                    LocalDateTime.now(), LocalDateTime.now()
            );

            when(avaliacaoRepository.buscarPorVendedorId(vendedorId, pageable)).thenReturn(paginaEntidade);
            when(mapper.paraResposta(avaliacao)).thenReturn(resposta);

            Page<RespostaAvaliacao> resultado = servicoAvaliacao.listarAvaliacoesDoVendedor(vendedorId, pageable);

            assertThat(resultado).isNotNull();
            assertThat(resultado.getContent()).hasSize(1);
            assertThat(resultado.getContent().get(0).comentario()).isEqualTo("Bom");
            verify(avaliacaoRepository, times(1)).buscarPorVendedorId(vendedorId, pageable);
        }
    }

    @Nested
    @DisplayName("Testes de Deleção de Avaliação")
    class TestesDelecao {

        @Test
        @DisplayName("Deve deletar avaliação logicamente (soft delete) com sucesso")
        void deveDeletarAvaliacaoComSucesso() {
            UUID avaliadorId = UUID.randomUUID();
            UUID avaliacaoId = UUID.randomUUID();
            UUID vendedorId = UUID.randomUUID();

            Usuario avaliador = Usuario.builder().id(avaliadorId).build();
            PerfilVendedor vendedor = PerfilVendedor.builder().id(vendedorId).build();
            
            Avaliacao avaliacao = Avaliacao.builder()
                    .id(avaliacaoId)
                    .avaliador(avaliador)
                    .vendedor(vendedor)
                    .deletada(false)
                    .build();

            when(avaliacaoRepository.findById(avaliacaoId)).thenReturn(Optional.of(avaliacao));

            servicoAvaliacao.deletarAvaliacao(avaliadorId, avaliacaoId);

            assertThat(avaliacao.getDeletada()).isTrue();
            verify(avaliacaoRepository, times(1)).save(avaliacao);
            verify(jobRecalculoAvaliacao, times(1)).recalcularEstatisticasAsync(vendedorId);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio com status FORBIDDEN quando outro usuário tentar deletar a avaliação")
        void deveLancarExcecaoQuandoOutroUsuarioDeletar() {
            UUID avaliadorId = UUID.randomUUID();
            UUID outroUsuarioId = UUID.randomUUID();
            UUID avaliacaoId = UUID.randomUUID();

            Usuario avaliador = Usuario.builder().id(avaliadorId).build();
            
            Avaliacao avaliacao = Avaliacao.builder()
                    .id(avaliacaoId)
                    .avaliador(avaliador)
                    .deletada(false)
                    .build();

            when(avaliacaoRepository.findById(avaliacaoId)).thenReturn(Optional.of(avaliacao));

            assertThatThrownBy(() -> servicoAvaliacao.deletarAvaliacao(outroUsuarioId, avaliacaoId))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasFieldOrPropertyWithValue("status", HttpStatus.FORBIDDEN)
                    .hasMessageContaining("Você só pode deletar as suas próprias avaliações");

            verify(avaliacaoRepository, never()).save(any(Avaliacao.class));
            verify(jobRecalculoAvaliacao, never()).recalcularEstatisticasAsync(any(UUID.class));
        }
    }
}
