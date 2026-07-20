package com.pecae.api.comprador.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcluirContaRequest {

    @NotBlank(message = "A senha atual é obrigatória")
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
    @JsonProperty("currentPassword")
    private String senhaAtual;
}
