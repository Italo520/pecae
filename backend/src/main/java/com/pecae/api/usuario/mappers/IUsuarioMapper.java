package com.pecae.api.usuario.mappers;

import com.pecae.api.usuario.dtos.AtualizarUsuarioRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

/**
 * Mapper MapStruct para conversões entre a entidade Usuario e seus DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface IUsuarioMapper {

    /**
     * Converte um objeto da entidade Usuario para DTO UsuarioResponse.
     *
     * @param usuario Entidade de usuário.
     * @return DTO com os dados do usuário.
     */
    UsuarioResponse toResponse(Usuario usuario);

    /**
     * Atualiza as propriedades da entidade Usuario a partir do DTO AtualizarUsuarioRequest, ignorando valores nulos.
     *
     * @param request DTO com as atualizações.
     * @param usuario Entidade Usuario que sofrerá as atualizações.
     */
    void updateEntity(AtualizarUsuarioRequest request, @MappingTarget Usuario usuario);
}
