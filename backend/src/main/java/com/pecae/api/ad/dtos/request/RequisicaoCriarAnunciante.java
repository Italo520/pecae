package com.pecae.api.ad.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * DTO que encapsula a requisição para criação de um novo Anunciante.
 */
public record RequisicaoCriarAnunciante(
    @NotBlank(message = "O nome da empresa é obrigatório")
    String nomeEmpresa,

    String nomeContato,

    @Email(message = "O e-mail informado é inválido")
    String emailContato,

    String telefoneContato
) {}
