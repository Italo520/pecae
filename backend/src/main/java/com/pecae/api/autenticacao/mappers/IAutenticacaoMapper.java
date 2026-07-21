package com.pecae.api.autenticacao.mappers;

import com.pecae.api.autenticacao.dtos.RegistroRequest;
import com.pecae.api.usuario.entities.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper MapStruct para converter requisições de autenticação em entidades.
 */
@Mapper(componentModel = "spring")
public interface IAutenticacaoMapper {

    /**
     * Converte um DTO de registro para a entidade Usuario.
     * Ignora campos sensíveis ou que necessitam de processamento adicional (como senhaHash).
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senhaHash", ignore = true)
    @Mapping(target = "googleId", ignore = true)
    @Mapping(target = "appleId", ignore = true)
    @Mapping(target = "telefone", ignore = true)
    @Mapping(target = "telefoneVerificado", constant = "false")
    @Mapping(target = "telefoneVerificadoEm", ignore = true)
    @Mapping(target = "emailVerificado", constant = "true")
    @Mapping(target = "emailVerificadoEm", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "ultimoAcessoEm", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    @Mapping(target = "deletadoEm", ignore = true)
    @Mapping(target = "emailOriginal", ignore = true)
    @Mapping(target = "status", constant = "ATIVO")
    Usuario toUsuario(RegistroRequest request);
}
