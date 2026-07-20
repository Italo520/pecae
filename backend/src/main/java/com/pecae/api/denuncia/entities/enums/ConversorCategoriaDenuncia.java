package com.pecae.api.denuncia.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorCategoriaDenuncia implements AttributeConverter<CategoriaDenuncia, String> {

    @Override
    public String convertToDatabaseColumn(CategoriaDenuncia attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case FRAUDE -> "FRAUD";
            case CONTEUDO_INADEQUADO -> "INAPPROPRIATE_CONTENT";
            case FALSO -> "MISLEADING_INFO";
            case SPAM, OUTRO -> "OTHER";
        };
    }

    @Override
    public CategoriaDenuncia convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "FRAUD" -> CategoriaDenuncia.FRAUDE;
            case "INAPPROPRIATE_CONTENT" -> CategoriaDenuncia.CONTEUDO_INADEQUADO;
            case "MISLEADING_INFO" -> CategoriaDenuncia.FALSO;
            case "ABUSIVE_BEHAVIOR", "OTHER" -> CategoriaDenuncia.OUTRO;
            default -> throw new IllegalArgumentException("Categoria de Denúncia desconhecida no banco de dados: " + dbData);
        };
    }
}
