package com.pecae.api.denuncia.mappers;

import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.Denuncia;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperDenuncia {

    @Mapping(target = "reporterId", source = "denunciante.id")
    @Mapping(target = "nomeReporter", source = "denunciante.nome")
    RespostaDenuncia paraResposta(Denuncia denuncia);
}
