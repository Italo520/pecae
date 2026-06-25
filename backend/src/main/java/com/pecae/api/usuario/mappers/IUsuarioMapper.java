package com.pecae.api.usuario.mappers;

import com.pecae.api.usuario.dtos.AtualizarUsuarioRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import org.mapstruct.AfterMapping;

/**
 * Mapper MapStruct para conversões entre a entidade Usuario e seus DTOs.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public abstract class IUsuarioMapper {

    @Autowired
    @Lazy
    protected PerfilVendedorRepository perfilVendedorRepository;

    /**
     * Converte um objeto da entidade Usuario para DTO UsuarioResponse.
     *
     * @param usuario Entidade de usuário.
     * @return DTO com os dados do usuário.
     */
    public abstract UsuarioResponse toResponse(Usuario usuario);

    @AfterMapping
    protected void setHasProfile(Usuario usuario, @MappingTarget UsuarioResponse response) {
        if (usuario != null && usuario.getId() != null) {
            response.setHasProfile(perfilVendedorRepository.existsByUsuarioId(usuario.getId()));
        }
    }

    /**
     * Atualiza as propriedades da entidade Usuario a partir do DTO AtualizarUsuarioRequest, ignorando valores nulos.
     *
     * @param request DTO com as atualizações.
     * @param usuario Entidade Usuario que sofrerá as atualizações.
     */
    public abstract void updateEntity(AtualizarUsuarioRequest request, @MappingTarget Usuario usuario);
}
