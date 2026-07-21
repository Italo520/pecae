package com.pecae.api.vendedor.mappers;

import com.pecae.api.vendedor.dtos.*;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.entities.EstatisticasVendedor;
import com.pecae.api.vendedor.entities.VerificacaoVendedor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface IVendedorMapper {

    @Mapping(target = "usuario", ignore = true)
    PerfilVendedor toEntity(CriarVendedorRequest request);

    @org.mapstruct.BeanMapping(nullValuePropertyMappingStrategy = org.mapstruct.NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "nome", source = "nome")
    @Mapping(target = "telefone", source = "telefone")
    @Mapping(target = "biografia", source = "biografia")
    void updateEntityFromDto(AtualizarVendedorRequest dto, @MappingTarget PerfilVendedor entity);

    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "nome", source = "nome")
    @Mapping(target = "documento", source = "documento")
    @Mapping(target = "telefone", source = "telefone")
    @Mapping(target = "biografia", source = "biografia")
    @Mapping(target = "urlLogo", source = "urlLogo")
    @Mapping(target = "urlBanner", source = "urlBanner")
    @Mapping(target = "tipoVendedor", source = "tipoVendedor")
    @Mapping(target = "criadoEm", source = "criadoEm")
    @Mapping(target = "atualizadoEm", source = "atualizadoEm")
    RespostaPerfilVendedor toResponse(PerfilVendedor entity);

    @Mapping(target = "usuarioId", source = "entity.usuario.id")
    @Mapping(target = "id", source = "entity.id")
    @Mapping(target = "nome", source = "entity.nome")
    @Mapping(target = "documento", source = "entity.documento")
    @Mapping(target = "telefone", source = "entity.telefone")
    @Mapping(target = "biografia", source = "entity.biografia")
    @Mapping(target = "urlLogo", source = "entity.urlLogo")
    @Mapping(target = "urlBanner", source = "entity.urlBanner")
    @Mapping(target = "tipoVendedor", source = "entity.tipoVendedor")
    @Mapping(target = "criadoEm", source = "entity.criadoEm")
    @Mapping(target = "atualizadoEm", source = "entity.atualizadoEm")
    @Mapping(target = "estatisticas", source = "stats")
    @Mapping(target = "verificacao", source = "verification")
    RespostaPerfilVendedor toResponseWithDetails(PerfilVendedor entity, RespostaEstatisticasVendedor stats, RespostaVerificacaoVendedor verification);

    @Mapping(target = "totalAnuncios", source = "totalAnuncios")
    @Mapping(target = "anunciosAtivos", source = "anunciosAtivos")
    @Mapping(target = "mediaAvaliacao", source = "mediaAvaliacao")
    @Mapping(target = "totalAvaliacoes", source = "totalAvaliacoes")
    RespostaEstatisticasVendedor toStatsResponse(EstatisticasVendedor entity);

    @Mapping(target = "solicitadoEm", source = "solicitadoEm")
    @Mapping(target = "resolvidoEm", source = "resolvidoEm")
    @Mapping(target = "motivoRejeicao", source = "motivoRejeicao")
    RespostaVerificacaoVendedor toVerificationResponse(VerificacaoVendedor entity);
}
