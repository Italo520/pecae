package com.pecae.api.moderacao.mappers;

import com.pecae.api.moderacao.dtos.response.RespostaLogAuditoria;
import com.pecae.api.moderacao.entities.LogAuditoria;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperModeracao {

    @Mapping(target = "moderadorId", source = "moderador.id")
    @Mapping(target = "nomeModerador", source = "moderador.nome")
    RespostaLogAuditoria paraRespostaLogAuditoria(LogAuditoria logAuditoria);
}
