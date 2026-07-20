package com.pecae.api.usuario.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para requisição de atualização da role/tipo de acesso de um usuário pelo Administrador.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarTipoRequest {

    @NotNull(message = "O tipo de usuário é obrigatório")
    @JsonProperty("role")
    private TipoUsuario tipo;
}
