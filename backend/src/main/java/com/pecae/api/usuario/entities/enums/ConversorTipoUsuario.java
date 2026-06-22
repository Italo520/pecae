package com.pecae.api.usuario.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Conversor JPA para mapear a enumeração TipoUsuario (em português)
 * para os valores correspondentes de string salvos no banco de dados legado (em inglês).
 */
@Converter(autoApply = true)
public class ConversorTipoUsuario implements AttributeConverter<TipoUsuario, String> {

    @Override
    public String convertToDatabaseColumn(TipoUsuario attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case COMPRADOR -> "BUYER";
            case VENDEDOR -> "SELLER";
            case AMBOS -> "BOTH";
            case ADMIN -> "ADMIN";
            case MODERADOR -> "MODERATOR";
        };
    }

    @Override
    public TipoUsuario convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return switch (dbData.toUpperCase()) {
            case "BUYER" -> TipoUsuario.COMPRADOR;
            case "SELLER" -> TipoUsuario.VENDEDOR;
            case "BOTH" -> TipoUsuario.AMBOS;
            case "ADMIN" -> TipoUsuario.ADMIN;
            case "MODERATOR" -> TipoUsuario.MODERADOR;
            default -> throw new IllegalArgumentException("Tipo de usuário desconhecido no banco de dados: " + dbData);
        };
    }
}
