package com.pecae.api.veiculo.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorTipoFoto implements AttributeConverter<TipoFoto, String> {

    @Override
    public String convertToDatabaseColumn(TipoFoto attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case EXTERIOR -> "EXTERIOR";
            case INTERIOR -> "INTERIOR";
            case MOTOR -> "ENGINE";
            case DANO -> "DAMAGE";
            case OUTRO -> "OTHER";
        };
    }

    @Override
    public TipoFoto convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "EXTERIOR" -> TipoFoto.EXTERIOR;
            case "INTERIOR" -> TipoFoto.INTERIOR;
            case "ENGINE" -> TipoFoto.MOTOR;
            case "DAMAGE" -> TipoFoto.DANO;
            case "OTHER" -> TipoFoto.OUTRO;
            default -> throw new IllegalArgumentException("Tipo de foto desconhecido no banco: " + dbData);
        };
    }
}
