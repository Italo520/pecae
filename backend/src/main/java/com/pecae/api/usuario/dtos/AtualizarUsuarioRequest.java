package com.pecae.api.usuario.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO com dados enviados para atualização do perfil do usuário.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtualizarUsuarioRequest {

    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    @JsonProperty("name")
    private String nome;

    @JsonProperty("phone")
    private String telefone;

    private String avatar;
}
