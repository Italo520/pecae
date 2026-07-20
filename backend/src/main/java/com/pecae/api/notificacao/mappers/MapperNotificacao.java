package com.pecae.api.notificacao.mappers;

import com.pecae.api.notificacao.dtos.response.RespostaNotificacao;
import com.pecae.api.notificacao.entities.Notificacao;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

/**
 * Mapper do MapStruct para converter entidades de Notificação em DTOs de resposta.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperNotificacao {

    /**
     * Converte uma entidade Notificacao para RespostaNotificacao DTO.
     */
    RespostaNotificacao paraRespostaNotificacao(Notificacao notificacao);
}
