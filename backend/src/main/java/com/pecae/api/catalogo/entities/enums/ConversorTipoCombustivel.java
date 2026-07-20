package com.pecae.api.catalogo.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorTipoCombustivel implements AttributeConverter<TipoCombustivel, String> {

    @Override
    public String convertToDatabaseColumn(TipoCombustivel attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case GASOLINA -> "GASOLINE";
            case ETANOL -> "ETHANOL";
            case FLEX -> "FLEX";
            case DIESEL -> "DIESEL";
            case ELETRICO -> "ELECTRIC";
            case HIBRIDO -> "HYBRID";
            case GNV -> "GNV";
        };
    }

    @Override
    public TipoCombustivel convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "GASOLINE" -> TipoCombustivel.GASOLINA;
            case "ETHANOL" -> TipoCombustivel.ETANOL;
            case "FLEX" -> TipoCombustivel.FLEX;
            case "DIESEL" -> TipoCombustivel.DIESEL;
            case "ELECTRIC" -> TipoCombustivel.ELETRICO;
            case "HYBRID" -> TipoCombustivel.HIBRIDO;
            case "GNV" -> TipoCombustivel.GNV;
            default -> throw new IllegalArgumentException("Tipo de combustível desconhecido no banco: " + dbData);
        };
    }
}
