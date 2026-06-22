package com.pecae.api.catalogo.services;

import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.entities.*;
import com.pecae.api.catalogo.mappers.ICatalogoMapper;
import com.pecae.api.catalogo.repositories.*;
import com.pecae.api.catalogo.services.impl.CatalogoServiceImpl;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do Serviço de Catálogo")
class CatalogoServiceTest {

    @Mock
    private MarcaVeiculoRepository brandRepository;

    @Mock
    private ModeloVeiculoRepository modelRepository;

    @Mock
    private VersaoVeiculoRepository versionRepository;

    @Mock
    private AnoVeiculoRepository yearRepository;

    @Mock
    private CategoriaPecaRepository categoryRepository;

    @Mock
    private CatalogoPecaRepository partRepository;

    @Mock
    private ICatalogoMapper catalogMapper;

    @InjectMocks
    private CatalogoServiceImpl catalogService;

    private MarcaVeiculo brand;
    private RespostaMarca brandResponse;

    @BeforeEach
    void setUp() {
        UUID brandId = UUID.randomUUID();
        brand = MarcaVeiculo.builder()
                .id(brandId)
                .nome("Toyota")
                .urlLogo("http://logo.png")
                .ativo(true)
                .build();

        brandResponse = new RespostaMarca(brandId, "Toyota", "http://logo.png");
    }

    @Test
    @DisplayName("obterTodasMarcas - Deve retornar marcas ativas com sucesso")
    void deveRetornarMarcasAtivas() {
        when(brandRepository.findAllByAtivoTrueOrderByNomeAsc()).thenReturn(List.of(brand));
        when(catalogMapper.toBrandResponseList(any())).thenReturn(List.of(brandResponse));

        List<RespostaMarca> result = catalogService.obterTodasMarcas();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nome()).isEqualTo("Toyota");
        verify(brandRepository, times(1)).findAllByAtivoTrueOrderByNomeAsc();
    }

    @Test
    @DisplayName("obterModelosPorMarca - Deve lancar ExcecaoRecursoNaoEncontrado quando marca nao existe")
    void deveLancarExcecaoQuandoMarcaNaoEncontrada() {
        UUID brandId = UUID.randomUUID();
        when(brandRepository.existsById(brandId)).thenReturn(false);

        assertThatThrownBy(() -> catalogService.obterModelosPorMarca(brandId))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                .hasMessageContaining("Marca não encontrada com ID");
    }

    @Test
    @DisplayName("criarMarca - Deve lancar ExcecaoNegocio (Conflict) se o nome ja existir")
    void deveLancarConflitoQuandoNomeMarcaExistir() {
        CriarMarcaRequest request = new CriarMarcaRequest("Toyota", null);
        when(brandRepository.findByNomeIgnoreCase(request.nome())).thenReturn(Optional.of(brand));

        assertThatThrownBy(() -> catalogService.criarMarca(request))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasFieldOrPropertyWithValue("status", HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("criarMarca - Deve criar marca se o nome for unico")
    void deveCriarMarcaQuandoNomeForUnico() {
        CriarMarcaRequest request = new CriarMarcaRequest("Ford", null);
        MarcaVeiculo newBrand = MarcaVeiculo.builder().nome("Ford").ativo(true).build();
        RespostaMarca response = new RespostaMarca(UUID.randomUUID(), "Ford", null);

        when(brandRepository.findByNomeIgnoreCase(request.nome())).thenReturn(Optional.empty());
        when(catalogMapper.toEntity(request)).thenReturn(newBrand);
        when(brandRepository.save(newBrand)).thenReturn(newBrand);
        when(catalogMapper.toBrandResponse(newBrand)).thenReturn(response);

        RespostaMarca result = catalogService.criarMarca(request);

        assertThat(result).isNotNull();
        assertThat(result.nome()).isEqualTo("Ford");
        verify(brandRepository, times(1)).save(newBrand);
    }

    @Test
    @DisplayName("desativarMarca - Deve desativar marca com sucesso")
    void deveDesativarMarca() {
        UUID brandId = brand.getId();
        when(brandRepository.findById(brandId)).thenReturn(Optional.of(brand));

        catalogService.desativarMarca(brandId);

        assertThat(brand.getAtivo()).isFalse();
        verify(brandRepository, times(1)).save(brand);
    }
}
