package com.pecae.api.catalogo.mappers;

import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.entities.*;
import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import com.pecae.api.catalogo.entities.enums.TipoTransmissao;
import com.pecae.api.catalogo.entities.enums.SegmentoVeiculo;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("Testes do ICatalogoMapper")
class CatalogoMapperTest {

    private final ICatalogoMapper mapper = Mappers.getMapper(ICatalogoMapper.class);

    @Test
    @DisplayName("Deve mapear MarcaVeiculo para RespostaMarca")
    void deveMapearMarcaParaResposta() {
        MarcaVeiculo brand = MarcaVeiculo.builder()
                .id(UUID.randomUUID())
                .nome("Toyota")
                .urlLogo("http://toyota.com/logo.png")
                .ativo(true)
                .build();

        RespostaMarca response = mapper.toBrandResponse(brand);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(brand.getId());
        assertThat(response.nome()).isEqualTo(brand.getNome());
        assertThat(response.urlLogo()).isEqualTo(brand.getUrlLogo());
    }

    @Test
    @DisplayName("Deve mapear ModeloVeiculo para RespostaModelo")
    void deveMapearModeloParaResposta() {
        MarcaVeiculo brand = MarcaVeiculo.builder().id(UUID.randomUUID()).build();
        ModeloVeiculo model = ModeloVeiculo.builder()
                .id(UUID.randomUUID())
                .nome("Corolla")
                .segmento(SegmentoVeiculo.SEDAN)
                .marca(brand)
                .ativo(true)
                .build();

        RespostaModelo response = mapper.toModelResponse(model);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(model.getId());
        assertThat(response.nome()).isEqualTo(model.getNome());
        assertThat(response.segmento()).isEqualTo(model.getSegmento());
        assertThat(response.marcaId()).isEqualTo(brand.getId());
    }

    @Test
    @DisplayName("Deve mapear VersaoVeiculo para RespostaVersao")
    void deveMapearVersaoParaResposta() {
        ModeloVeiculo model = ModeloVeiculo.builder().id(UUID.randomUUID()).build();
        VersaoVeiculo version = VersaoVeiculo.builder()
                .id(UUID.randomUUID())
                .nome("Altis Premium")
                .tipoCombustivel(TipoCombustivel.HIBRIDO)
                .tipoTransmissao(TipoTransmissao.CVT)
                .cilindradaCc(1800)
                .modelo(model)
                .ativo(true)
                .build();

        RespostaVersao response = mapper.toVersionResponse(version);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(version.getId());
        assertThat(response.nome()).isEqualTo(version.getNome());
        assertThat(response.tipoCombustivel()).isEqualTo(version.getTipoCombustivel());
        assertThat(response.tipoTransmissao()).isEqualTo(version.getTipoTransmissao());
        assertThat(response.cilindradaCc()).isEqualTo(version.getCilindradaCc());
        assertThat(response.modeloId()).isEqualTo(model.getId());
    }

    @Test
    @DisplayName("Deve mapear CriarMarcaRequest para MarcaVeiculo")
    void deveMapearCriarRequisitoParaMarca() {
        CriarMarcaRequest request = new CriarMarcaRequest("Toyota", "http://logo.png");

        MarcaVeiculo brand = mapper.toEntity(request);

        assertThat(brand).isNotNull();
        assertThat(brand.getNome()).isEqualTo(request.nome());
        assertThat(brand.getUrlLogo()).isEqualTo(request.urlLogo());
        assertThat(brand.getAtivo()).isTrue();
    }
}
