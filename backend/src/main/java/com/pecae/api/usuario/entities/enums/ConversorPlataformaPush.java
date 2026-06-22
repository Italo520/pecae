package com.pecae.api.usuario.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Conversor JPA para mapear a enumeração PlataformaPush (em português)
 * para os valores correspondentes de string salvos no banco de dados legado (em inglês minúsculo).
 */
@Converter(autoApply = true)
public class ConversorPlataformaPush implements AttributeConverter<PlataformaPush, String> {

    @Override
    public String convertToDatabaseColumn(PlataformaPush attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case IOS -> "ios";
            case ANDROID -> "android";
            case WEB -> "web";
        };
    }

    @Override
    public PlataformaPush convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return switch (dbData.toLowerCase()) {
            case "ios" -> PlataformaPush.IOS;
            case "android" -> PlataformaPush.ANDROID;
            case "web" -> PlataformaPush.WEB;
            default -> throw new IllegalArgumentException("Plataforma push desconhecida no banco de dados: " + dbData);
        };
    }
}
