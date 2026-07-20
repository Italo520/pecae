package com.pecae.api.autenticacao.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO para requisição de registro de um novo usuário.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistroRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    @JsonProperty("name")
    private String nome;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "O e-mail informado é inválido")
    @Size(max = 255, message = "O e-mail não deve exceder 255 caracteres")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter pelo menos 8 caracteres")
    @JsonProperty("password")
    private String senha;

    @NotNull(message = "O tipo de usuário é obrigatório")
    @JsonProperty("type")
    private TipoUsuario tipo;

    @AssertTrue(message = "Você deve aceitar os termos de uso")
    @JsonProperty("termsAccepted")
    private boolean termosAceitos;

    @AssertTrue(message = "Você deve aceitar a política de privacidade")
    @JsonProperty("privacyAccepted")
    private boolean privacidadeAceita;
}
