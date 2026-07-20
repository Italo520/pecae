package com.pecae.api.comprador.mappers;

import com.pecae.api.comprador.dtos.AtualizarCompradorRequest;
import com.pecae.api.comprador.dtos.AtualizarPreferenciasNotificacaoRequest;
import com.pecae.api.comprador.dtos.RespostaPerfilComprador;
import com.pecae.api.comprador.dtos.RespostaPreferenciasNotificacao;
import com.pecae.api.comprador.entities.PerfilComprador;
import com.pecae.api.comprador.entities.PreferenciasNotificacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ICompradorMapper {

    @Mapping(source = "usuario.id", target = "usuarioId")
    RespostaPerfilComprador toResponse(PerfilComprador perfil);

    void updateEntity(AtualizarCompradorRequest request, @MappingTarget PerfilComprador perfil);

    @Mapping(source = "usuario.id", target = "usuarioId")
    RespostaPreferenciasNotificacao toResponse(PreferenciasNotificacao preferencias);

    @Mapping(source = "push", target = "pushHabilitado")
    @Mapping(source = "email", target = "emailHabilitado")
    @Mapping(source = "noApp", target = "inAppHabilitado")
    void updateEntity(AtualizarPreferenciasNotificacaoRequest request, @MappingTarget PreferenciasNotificacao preferencias);
}
