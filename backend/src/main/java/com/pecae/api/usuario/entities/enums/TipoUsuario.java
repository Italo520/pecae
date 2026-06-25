package com.pecae.api.usuario.entities.enums;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Define o tipo ou papel da conta do usuário no sistema.
 */
public enum TipoUsuario {
    @JsonProperty("BUYER")
    COMPRADOR,
    @JsonProperty("SELLER")
    VENDEDOR,
    @JsonProperty("BOTH")
    AMBOS,
    @JsonProperty("ADMIN")
    ADMIN,
    @JsonProperty("MODERATOR")
    MODERADOR
}
