package com.pecae.api.veiculo.services;

import com.pecae.api.compartilhado.armazenamento.ServicoArmazenamento;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;
import com.pecae.api.veiculo.entities.FotoVeiculo;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.enums.TipoFoto;
import com.pecae.api.veiculo.jobs.JobProcessamentoFoto;
import com.pecae.api.veiculo.mappers.MapperVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioFotoVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.veiculo.services.impl.ServicoFotoVeiculoImpl;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoFotoVeiculo")
class ServicoFotoVeiculoTest {

    @Mock
    private RepositorioVeiculo repositorioVeiculo;

    @Mock
    private RepositorioFotoVeiculo repositorioFotoVeiculo;

    @Mock
    private PerfilVendedorRepository perfilVendedorRepository;

    @Mock
    private ServicoArmazenamento servicoArmazenamento;

    @Mock
    private JobProcessamentoFoto jobProcessamentoFoto;

    @Mock
    private MapperVeiculo mapperVeiculo;

    @InjectMocks
    private ServicoFotoVeiculoImpl servicoFotoVeiculo;

    @Nested
    @DisplayName("Testes de Adicionar Foto")
    class TestesAdicionar {

        @Test
        @DisplayName("Deve adicionar foto com sucesso")
        void deveAdicionarComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();
            MockMultipartFile arquivo = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(perfil).build();
            FotoVeiculo fotoSalva = FotoVeiculo.builder().id(UUID.randomUUID()).veiculo(veiculo).urlFoto("http://fake.url").tipo(TipoFoto.EXTERIOR).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfil.getId())).thenReturn(Optional.of(veiculo));
            when(repositorioFotoVeiculo.countByVeiculoId(veiculoId)).thenReturn(0L);
            when(servicoArmazenamento.upload(any(MultipartFile.class), eq("vehicles"), anyString())).thenReturn("http://fake.url");
            when(repositorioFotoVeiculo.save(any(FotoVeiculo.class))).thenReturn(fotoSalva);
            when(jobProcessamentoFoto.processarAsync(fotoSalva.getId())).thenReturn(CompletableFuture.completedFuture(null));

            RespostaFotoVeiculo respostaEsperada = new RespostaFotoVeiculo(fotoSalva.getId(), "http://fake.url", null, 1, "EXTERIOR");
            when(mapperVeiculo.paraRespostaFoto(fotoSalva)).thenReturn(respostaEsperada);

            RespostaFotoVeiculo resultado = servicoFotoVeiculo.adicionarFoto(usuarioId, veiculoId, arquivo, TipoFoto.EXTERIOR);

            assertThat(resultado).isNotNull();
            assertThat(resultado.urlFoto()).isEqualTo("http://fake.url");
            verify(repositorioFotoVeiculo, times(1)).save(any(FotoVeiculo.class));
            verify(jobProcessamentoFoto, times(1)).processarAsync(fotoSalva.getId());
        }

        @Test
        @DisplayName("Deve lançar ExcecaoNegocio se atingir limite de 10 fotos")
        void deveLancarExcecaoSeLimiteExcedido() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();
            MockMultipartFile arquivo = new MockMultipartFile("file", "test.jpg", "image/jpeg", new byte[]{1, 2, 3});

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(perfil).build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfil.getId())).thenReturn(Optional.of(veiculo));
            when(repositorioFotoVeiculo.countByVeiculoId(veiculoId)).thenReturn(10L);

            assertThatThrownBy(() -> servicoFotoVeiculo.adicionarFoto(usuarioId, veiculoId, arquivo, TipoFoto.EXTERIOR))
                    .isInstanceOf(ExcecaoNegocio.class)
                    .hasMessageContaining("Limite máximo de 10 fotos por veículo atingido");
        }
    }

    @Nested
    @DisplayName("Testes de Remover Foto")
    class TestesRemover {

        @Test
        @DisplayName("Deve remover foto com sucesso")
        void deveRemoverComSucesso() {
            UUID usuarioId = UUID.randomUUID();
            UUID veiculoId = UUID.randomUUID();
            UUID fotoId = UUID.randomUUID();

            PerfilVendedor perfil = PerfilVendedor.builder().id(UUID.randomUUID()).build();
            Veiculo veiculo = Veiculo.builder().id(veiculoId).perfilVendedor(perfil).build();
            FotoVeiculo foto = FotoVeiculo.builder().id(fotoId).veiculo(veiculo).urlFoto("https://supabase.com/object/public/vehicles/path.jpg").build();

            when(perfilVendedorRepository.findByUsuarioId(usuarioId)).thenReturn(Optional.of(perfil));
            when(repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfil.getId())).thenReturn(Optional.of(veiculo));
            when(repositorioFotoVeiculo.findById(fotoId)).thenReturn(Optional.of(foto));

            servicoFotoVeiculo.removerFoto(usuarioId, veiculoId, fotoId);

            verify(servicoArmazenamento, times(1)).delete("vehicles", "path.jpg");
            verify(repositorioFotoVeiculo, times(1)).delete(foto);
        }
    }
}
