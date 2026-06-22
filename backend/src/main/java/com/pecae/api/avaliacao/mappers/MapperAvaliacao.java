package com.pecae.api.avaliacao.mappers;

import com.pecae.api.avaliacao.dtos.response.RespostaAvaliacao;
import com.pecae.api.avaliacao.entities.Avaliacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperAvaliacao {

    @Mapping(target = "vendedorId", source = "vendedor.id")
    @Mapping(target = "avaliadorId", source = "avaliador.id")
    @Mapping(target = "nomeAvaliador", source = "avaliador.nome")
    RespostaAvaliacao paraResposta(Avaliacao avaliacao);
}
