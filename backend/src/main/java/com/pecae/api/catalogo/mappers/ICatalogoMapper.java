package com.pecae.api.catalogo.mappers;

import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.entities.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ICatalogoMapper {

    RespostaMarca toBrandResponse(MarcaVeiculo entity);

    @Mapping(target = "marcaId", source = "marca.id")
    RespostaModelo toModelResponse(ModeloVeiculo entity);

    @Mapping(target = "modeloId", source = "modelo.id")
    RespostaVersao toVersionResponse(VersaoVeiculo entity);

    @Mapping(target = "versaoId", source = "versao.id")
    RespostaAno toYearResponse(AnoVeiculo entity);

    RespostaCategoriaPeca toCategoryResponse(CategoriaPeca entity);

    @Mapping(target = "versaoId", source = "versao.id")
    RespostaCatalogoPeca toPartCatalogResponse(CatalogoPeca entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "modelos", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    MarcaVeiculo toEntity(CriarMarcaRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "marca", ignore = true)
    @Mapping(target = "versoes", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    ModeloVeiculo toEntity(CriarModeloRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "modelo", ignore = true)
    @Mapping(target = "anos", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    VersaoVeiculo toEntity(CriarVersaoRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    CategoriaPeca toEntity(CriarCategoriaPecaRequest request);

    List<RespostaMarca> toBrandResponseList(List<MarcaVeiculo> entities);
    List<RespostaModelo> toModelResponseList(List<ModeloVeiculo> entities);
    List<RespostaVersao> toVersionResponseList(List<VersaoVeiculo> entities);
    List<RespostaAno> toYearResponseList(List<AnoVeiculo> entities);
    List<RespostaCategoriaPeca> toCategoryResponseList(List<CategoriaPeca> entities);
    List<RespostaCatalogoPeca> toPartCatalogResponseList(List<CatalogoPeca> entities);
}
