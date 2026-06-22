package com.pecae.api.catalogo.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorTipoTransmissao implements AttributeConverter<TipoTransmissao, String> {

    @Override
    public String convertToDatabaseColumn(TipoTransmissao attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case MANUAL -> "MANUAL";
            case AUTOMATICO -> "AUTOMATIC";
            case CVT -> "CVT";
            case SEMI_AUTOMATICO -> "SEMI_AUTOMATIC";
            case DUPLA_EMBREAGEM -> "DUAL_CLUTCH";
        };
    }

    @Override
    public TipoTransmissao convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "MANUAL" -> TipoTransmissao.MANUAL;
            case "AUTOMATIC" -> TipoTransmissao.AUTOMATICO;
            case "CVT" -> TipoTransmissao.CVT;
            case "SEMI_AUTOMATIC" -> TipoTransmissao.SEMI_AUTOMATICO;
            case "DUAL_CLUTCH" -> TipoTransmissao.DUPLA_EMBREAGEM;
            default -> throw new IllegalArgumentException("Tipo de transmissão desconhecido no banco: " + dbData);
        };
    }
}
