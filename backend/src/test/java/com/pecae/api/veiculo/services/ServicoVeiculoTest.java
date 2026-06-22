package com.pecae.api.veiculo.services;

import com.pecae.api.catalogo.entities.AnoVeiculo;
import com.pecae.api.catalogo.entities.VersaoVeiculo;
import com.pecae.api.catalogo.repositories.AnoVeiculoRepository;
import com.pecae.api.catalogo.repositories.VersaoVeiculoRepository;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.veiculo.dtos.CriarVeiculoRequest;
import com.pecae.api.veiculo.dtos.AtualizarVeiculoRequest;
import com.pecae.api.veiculo.dtos.RespostaDetalheVeiculo;
import com.pecae.api.veiculo.dtos.RespostaVeiculo;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.enums.StatusVeiculo;
import com.pecae.api.veiculo.mappers.MapperVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.veiculo.services.impl.ServicoVeiculoImpl;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoVeiculo")
class ServicoVeiculoTest {

    @Mock
    private RepositorioVeiculo repositorioVeiculo;

    @Mock
    private PerfilVendedorRepository perfilVendedorRepository;

    @Mock
    private VersaoVeiculoRepository versaoVeiculoRepository;

    @Mock
    private AnoVeiculoRepository anoVeiculoRepository;

    @Mock
    private MapperVeiculo mapperVeiculo;

    @InjectMocks
    private ServicoVeiculoImpl servicoVeiculo;

    @Nested
    @DisplayName("Testes de Cadastro")
    class TestesCriar {

        @Test
        @DisplayName("Deve cadastrar veículo com sucesso")
        void deveCadastrarComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID versaoId = UUID.randomUUID();
            UUID anoId = UUID.randomUUID();

            CriarVeiculoRequest request = new CriarVeiculoRequest(
                    versaoId, anoId, "ABC1234", "Preto", "São Paulo", "SP",
                    -23.55, -46.63, "Sem observações", null, 10000, new ArrayList<>()
            );

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            VersaoVeiculo versao = VersaoVeiculo.builder().id(versaoId).build();
            AnoVeiculo ano = AnoVeiculo.builder().id(anoId).ano(2020).build();
            Veiculo veiculo = Veiculo.builder().placa("ABC1234").cor("Preto").build();
            Veiculo veiculoSalvo = Veiculo.builder().id(UUID.randomUUID()).placa("ABC1234").cor("Preto").status(StatusVeiculo.RASCUNHO).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.existsByPlaca(request.placa())).thenReturn(false);
            when(versaoVeiculoRepository.findById(versaoId)).thenReturn(Optional.of(versao));
            when(anoVeiculoRepository.findById(anoId)).thenReturn(Optional.of(ano));
            when(mapperVeiculo.paraEntidade(request)).thenReturn(veiculo);
            when(repositorioVeiculo.save(veiculo)).thenReturn(veiculoSalvo);

            RespostaDetalheVeiculo respostaEsperada = new RespostaDetalheVeiculo(
                    veiculoSalvo.getId(), perfil.getId(), "Marca", "Modelo", "Versao", 2020,
                    "ABC1234", "Preto", "São Paulo", "SP", -23.55, -46.63, "Sem observações",
                    "RASCUNHO", "GASOLINA", 10000, new ArrayList<>(), new ArrayList<>(), null, null
            );
            when(mapperVeiculo.paraRespostaDetalhe(veiculoSalvo)).thenReturn(respostaEsperada);

            RespostaDetalheVeiculo resultado = servicoVeiculo.criar(usuarioId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.placa()).isEqualTo("ABC1234");
            verify(repositorioVeiculo, times(1)).save(veiculo);
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se placa for duplicada")
        void deveLancarExcecaoSePlacaDuplicada() {
            UUID usuarioId = UUID.randomUUID();
            CriarVeiculoRequest request = new CriarVeiculoRequest(
                    UUID.randomUUID(), UUID.randomUUID(), "ABC1234", "Preto", "São Paulo", "SP",
                    null, null, null, null, null, null
            );

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.existsByPlaca("ABC1234")).thenReturn(true);

            assertThatThrownBy(() -> servicoVeiculo.criar(usuarioId, request))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Já existe um veículo cadastrado com a placa informada");
        }
    }

    @Nested
    @DisplayName("Testes de Atualização")
    class TestesAtualizar {

        @Test
        @DisplayName("Deve atualizar veículo com sucesso")
        void deveAtualizarComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();
            AtualizarVeiculoRequest request = new AtualizarVeiculoRequest(
                    "XYZ9999", "Branco", "Campinas", "SP", null, null, null, null, 12000, null
            );

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).placa("ABC1234").perfilVendedor(perfil).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfil.getId())).thenReturn(Optional.of(veiculo));
            when(repositorioVeiculo.existsByPlacaAndIdNot("XYZ9999", veiculoId)).thenReturn(false);
            when(repositorioVeiculo.save(veiculo)).thenReturn(veiculo);

            RespostaDetalheVeiculo respostaEsperada = new RespostaDetalheVeiculo(
                    veiculoId, perfil.getId(), "Marca", "Modelo", "Versao", 2020,
                    "XYZ9999", "Branco", "Campinas", "SP", null, null, null,
                    "RASCUNHO", "GASOLINA", 12000, new ArrayList<>(), new ArrayList<>(), null, null
            );
            when(mapperVeiculo.paraRespostaDetalhe(veiculo)).thenReturn(respostaEsperada);

            RespostaDetalheVeiculo resultado = servicoVeiculo.atualizar(usuarioId, veiculoId, request);

            assertThat(resultado).isNotNull();
            assertThat(resultado.placa()).isEqualTo("XYZ9999");
            verify(mapperVeiculo, times(1)).atualizarEntidadeDoDto(request, veiculo);
            verify(repositorioVeiculo, times(1)).save(veiculo);
        }
    }

    @Nested
    @DisplayName("Testes de Deleção")
    class TestesDeletar {

        @Test
        @DisplayName("Deve deletar veículo com sucesso")
        void deveDeletarComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(perfil).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfil.getId())).thenReturn(Optional.of(veiculo));

            servicoVeiculo.deletar(usuarioId, veiculoId);

            verify(repositorioVeiculo, times(1)).delete(veiculo);
        }
    }
}
