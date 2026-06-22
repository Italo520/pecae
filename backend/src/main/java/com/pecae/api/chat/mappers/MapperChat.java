package com.pecae.api.chat.mappers;

import com.pecae.api.chat.dtos.RespostaMensagemChat;
import com.pecae.api.chat.entities.MensagemChat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MapperChat {

    @Mapping(target = "salaId", source = "sala.id")
    @Mapping(target = "remetenteId", source = "remetente.id")
    RespostaMensagemChat paraRespostaMensagem(MensagemChat mensagem);
}
