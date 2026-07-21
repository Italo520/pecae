package com.pecae.api.usuario.entities.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
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
    MODERADOR;

    @JsonCreator
    public static TipoUsuario fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String upper = value.trim().toUpperCase();
        return switch (upper) {
            case "BUYER", "COMPRADOR" -> COMPRADOR;
            case "SELLER", "VENDEDOR" -> VENDEDOR;
            case "BOTH", "AMBOS" -> AMBOS;
            case "ADMIN" -> ADMIN;
            case "MODERATOR", "MODERADOR" -> MODERADOR;
            default -> throw new IllegalArgumentException("Tipo de usuário desconhecido: " + value);
        };
    }
}
