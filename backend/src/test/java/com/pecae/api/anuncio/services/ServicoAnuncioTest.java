package com.pecae.api.anuncio.services;

import com.pecae.api.anuncio.dtos.*;
import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.entities.EstatisticasAnuncio;
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.jobs.JobVisualizacaoAnuncio;
import com.pecae.api.anuncio.mappers.MapperAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioEstatisticasAnuncio;
import com.pecae.api.anuncio.services.impl.MaquinaEstadoAnuncio;
import com.pecae.api.anuncio.services.impl.ServicoAnuncioImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.enums.StatusVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.vendedor.entities.EstatisticasVendedor;
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

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.pecae.api.catalogo.repositories.MarcaVeiculoRepository;
import com.pecae.api.catalogo.repositories.ModeloVeiculoRepository;
import com.pecae.api.favorito.repositories.RepositorioBuscaSalva;
import com.pecae.api.notificacao.services.IServicoNotificacao;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoAnuncio")
class ServicoAnuncioTest {

    @Mock
    private RepositorioBuscaSalva repositorioBuscaSalva;

    @Mock
    private IServicoNotificacao servicoNotificacao;

    @Mock
    private RepositorioAnuncio repositorioAnuncio;

    @Mock
    private RepositorioEstatisticasAnuncio repositorioEstatisticasAnuncio;

    @Mock
    private PerfilVendedorRepository perfilVendedorRepository;

    @Mock
    private RepositorioVeiculo repositorioVeiculo;

    @Mock
    private MapperAnuncio mapperAnuncio;

    @Mock
    private MaquinaEstadoAnuncio maquinaEstado;

    @Mock
    private JobVisualizacaoAnuncio jobVisualizacaoAnuncio;

    @Mock
    private MarcaVeiculoRepository marcaVeiculoRepository;

    @Mock
    private ModeloVeiculoRepository modeloVeiculoRepository;

    @InjectMocks
    private ServicoAnuncioImpl servicoAnuncio;

    @Nested
    @DisplayName("Testes de Busca Pública")
    class TestesBusca {

        @Test
        @DisplayName("Deve listar anúncios públicos com sucesso")
        void deveListarPublicosComSucesso() {
            FiltrosAnuncioQuery filtros = new FiltrosAnuncioQuery(null, null, "São Paulo", "SP", 0, 20);
            Pageable pageable = PageRequest.of(0, 20);
            Anuncio anuncio = Anuncio.builder().id(UUID.randomUUID()).build();
            Page<Anuncio> page = new PageImpl<>(Collections.singletonList(anuncio));
            RespostaAnuncio respostaDto = new RespostaAnuncio(
                anuncio.getId(), "Título", "PUBLICADO", 10, "Marca", "Modelo", "Versão", 2020, "Preto", "São Paulo", "SP", null, UUID.randomUUID(), "Vendedor", true, LocalDateTime.now(), false
            );

            when(repositorioAnuncio.buscarPublicados(null, null, "São Paulo", "SP", null, null, null, null, pageable)).thenReturn(page);
            when(mapperAnuncio.paraResposta(anuncio)).thenReturn(respostaDto);

            Page<RespostaAnuncio> resultado = servicoAnuncio.listarPublicos(filtros);

            assertThat(resultado).isNotNull().hasSize(1);
            assertThat(resultado.getContent().get(0).id()).isEqualTo(anuncio.getId());
            verify(repositorioAnuncio, times(1)).buscarPublicados(null, null, "São Paulo", "SP", null, null, null, null, pageable);
        }

        @Test
        @DisplayName("Deve buscar detalhe de anúncio publicado com sucesso e disparar visualização assíncrona")
        void deveBuscarDetalheComSucesso() {
            UUID anuncioId = UUID.randomUUID();
            String ip = "127.0.0.1";
            PerfilVendedor vendedor = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .status(StatusAnuncio.PUBLICADO)
                .perfilVendedor(vendedor)
                .build();
            RespostaDetalheAnuncio respostaDetalhe = new RespostaDetalheAnuncio(
                anuncioId, "Título", "Descrição", "PUBLICADO", 10, 5, UUID.randomUUID(), "Marca", "Modelo", "Versão", 2020, "Preto", "obs", 10000, Collections.emptyList(), Collections.emptyList(), "São Paulo", "SP", -23.55, -46.63, vendedor.getId(), "Vendedor", "1199999999", "logo", true, 4.5, 10, LocalDateTime.now(), LocalDateTime.now(), LocalDateTime.now().plusDays(30), null
            );

            when(repositorioAnuncio.findByIdAndStatus(anuncioId, StatusAnuncio.PUBLICADO)).thenReturn(Optional.of(anuncio));
            when(mapperAnuncio.paraRespostaDetalhe(anuncio)).thenReturn(respostaDetalhe);

            RespostaDetalheAnuncio resultado = servicoAnuncio.buscarDetalhe(anuncioId, ip);

            assertThat(resultado).isNotNull();
            assertThat(resultado.id()).isEqualTo(anuncioId);
            verify(jobVisualizacaoAnuncio, times(1)).registrarVisualizacaoAsync(anuncioId, ip);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando anúncio não está publicado")
        void deveLancarExcecaoQuandoNaoPublicado() {
            UUID anuncioId = UUID.randomUUID();
            when(repositorioAnuncio.findByIdAndStatus(anuncioId, StatusAnuncio.PUBLICADO)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> servicoAnuncio.buscarDetalhe(anuncioId, "127.0.0.1"))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                .hasMessageContaining("Anúncio publicado não encontrado.");
        }
    }

    @Nested
    @DisplayName("Testes de Criação")
    class TestesCriacao {

        @Test
        @DisplayName("Deve criar anúncio com sucesso")
        void deveCriarComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();
            CriarAnuncioRequest request = new CriarAnuncioRequest(veiculoId, "Título do Anúncio", "Descrição");

            PerfilVendedor vendedor = PerfilVendedor.builder()
                .id(UUID.randomUUID())
                .estatisticas(EstatisticasVendedor.builder().totalAnuncios(5).anunciosAtivos(2).build())
                .build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(vendedor).build();
            Anuncio anuncio = Anuncio.builder().id(UUID.randomUUID()).perfilVendedor(vendedor).veiculo(veiculo).titulo("Título do Anúncio").status(StatusAnuncio.PENDENTE).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(vendedor));
            when(repositorioVeiculo.findById(veiculoId)).thenReturn(Optional.of(veiculo));
            when(repositorioAnuncio.findAllByPerfilVendedorId(any(), any())).thenReturn(Page.empty());
            when(repositorioAnuncio.save(any(Anuncio.class))).thenReturn(anuncio);

            RespostaDetalheAnuncio respostaDetalhe = new RespostaDetalheAnuncio(
                anuncio.getId(), "Título do Anúncio", "Descrição", "PENDENTE", 0, 0, veiculoId, "Marca", "Modelo", "Versão", 2020, "Preto", "obs", 10000, Collections.emptyList(), Collections.emptyList(), "São Paulo", "SP", null, null, vendedor.getId(), "Vendedor", "119999", "logo", true, 4.5, 10, LocalDateTime.now(), null, null, null
            );
            when(mapperAnuncio.paraRespostaDetalhe(anuncio)).thenReturn(respostaDetalhe);

            RespostaDetalheAnuncio resultado = servicoAnuncio.criar(usuarioId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.titulo()).isEqualTo("Título do Anúncio");
            assertThat(vendedor.getEstatisticas().getTotalAnuncios()).isEqualTo(6);
            verify(repositorioAnuncio, times(1)).save(any(Anuncio.class));
            verify(repositorioEstatisticasAnuncio, times(1)).save(any(EstatisticasAnuncio.class));
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se veículo não pertencer ao vendedor logado")
        void deveLancarExcecaoSeVeiculoNaoPertenceAoVendedor() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();
            CriarAnuncioRequest request = new CriarAnuncioRequest(veiculoId, "Título do Anúncio", "Descrição");

            PerfilVendedor vendedor = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            PerfilVendedor outroVendedor = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(outroVendedor).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(vendedor));
            when(repositorioVeiculo.findById(veiculoId)).thenReturn(Optional.of(veiculo));

            assertThatThrownBy(() -> servicoAnuncio.criar(usuarioId, request))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Este veículo não pertence ao seu perfil.");
        }
    }

    @Nested
    @DisplayName("Testes de Edição")
    class TestesEdicao {

        @Test
        @DisplayName("Deve atualizar anúncio e reverter para PENDENTE se estiver PUBLICADO")
        void deveAtualizarEReverterParaPendente() {
            UUID usuarioId = UUID.randomUUID();
            UUID anuncioId = UUID.randomUUID();
            AtualizarAnuncioRequest request = new AtualizarAnuncioRequest("Novo Título do Anúncio", "Nova descrição");

            PerfilVendedor vendedor = PerfilVendedor.builder()
                .id(UUID.randomUUID())
                .estatisticas(EstatisticasVendedor.builder().totalAnuncios(5).anunciosAtivos(2).build())
                .build();
            Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .perfilVendedor(vendedor)
                .status(StatusAnuncio.PUBLICADO)
                .titulo("Título Antigo")
                .build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(vendedor));
            when(repositorioAnuncio.findByIdAndPerfilVendedorId(anuncioId, vendedor.getId())).thenReturn(Optional.of(anuncio));
            when(repositorioAnuncio.save(anuncio)).thenReturn(anuncio);

            servicoAnuncio.atualizar(usuarioId, anuncioId, request);

            assertThat(anuncio.getStatus()).isEqualTo(StatusAnuncio.PENDENTE);
            assertThat(anuncio.getTitulo()).isEqualTo("Novo Título do Anúncio");
            assertThat(vendedor.getEstatisticas().getAnunciosAtivos()).isEqualTo(1);
            verify(maquinaEstado, times(1)).validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.PENDENTE);
        }
    }

    @Nested
    @DisplayName("Testes de Ações de Ciclo de Vida")
    class TestesAcoes {

        @Test
        @DisplayName("Deve marcar como VENDIDO com sucesso, mudando status de anúncio e veículo")
        void deveMarcarComoVendidoComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID anuncioId = UUID.randomUUID();

            PerfilVendedor vendedor = PerfilVendedor.builder()
                .id(UUID.randomUUID())
                .estatisticas(EstatisticasVendedor.builder().totalAnuncios(5).anunciosAtivos(2).build())
                .build();
            Veiculo veiculo = Veiculo.builder().status(StatusVeiculo.ATIVO).build();
            Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .perfilVendedor(vendedor)
                .veiculo(veiculo)
                .status(StatusAnuncio.PUBLICADO)
                .build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(vendedor));
            when(repositorioAnuncio.findByIdAndPerfilVendedorId(anuncioId, vendedor.getId())).thenReturn(Optional.of(anuncio));

            servicoAnuncio.marcarComoVendido(usuarioId, anuncioId);

            assertThat(anuncio.getStatus()).isEqualTo(StatusAnuncio.VENDIDO);
            assertThat(veiculo.getStatus()).isEqualTo(StatusVeiculo.VENDIDO);
            assertThat(vendedor.getEstatisticas().getAnunciosAtivos()).isEqualTo(1);
            verify(maquinaEstado, times(1)).validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.VENDIDO);
            verify(repositorioAnuncio, times(1)).save(anuncio);
            verify(repositorioVeiculo, times(1)).save(veiculo);
        }

        @Test
        @DisplayName("Deve deletar anúncio (soft-delete) com sucesso")
        void deveDeletarComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID anuncioId = UUID.randomUUID();

            PerfilVendedor vendedor = PerfilVendedor.builder()
                .id(UUID.randomUUID())
                .estatisticas(EstatisticasVendedor.builder().totalAnuncios(5).anunciosAtivos(2).build())
                .build();
            Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .perfilVendedor(vendedor)
                .status(StatusAnuncio.PUBLICADO)
                .build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(vendedor));
            when(repositorioAnuncio.findByIdAndPerfilVendedorId(anuncioId, vendedor.getId())).thenReturn(Optional.of(anuncio));

            servicoAnuncio.remover(usuarioId, anuncioId);

            assertThat(anuncio.getStatus()).isEqualTo(StatusAnuncio.EXPIRADO);
            assertThat(vendedor.getEstatisticas().getAnunciosAtivos()).isEqualTo(1);
            assertThat(vendedor.getEstatisticas().getTotalAnuncios()).isEqualTo(4);
            verify(maquinaEstado, times(1)).validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.EXPIRADO);
            verify(repositorioAnuncio, times(1)).delete(anuncio);
        }
    }
}
