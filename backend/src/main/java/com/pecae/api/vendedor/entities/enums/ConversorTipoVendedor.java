package com.pecae.api.vendedor.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorTipoVendedor implements AttributeConverter<TipoVendedor, String> {

    @Override
    public String convertToDatabaseColumn(TipoVendedor attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case INDIVIDUAL -> "INDIVIDUAL";
            case CONCESSIONARIA -> "DEALERSHIP";
            case DESMANCHE -> "JUNKYARD";
        };
    }

    @Override
    public TipoVendedor convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "INDIVIDUAL" -> TipoVendedor.INDIVIDUAL;
            case "DEALERSHIP" -> TipoVendedor.CONCESSIONARIA;
            case "JUNKYARD" -> TipoVendedor.DESMANCHE;
            default -> throw new IllegalArgumentException("Tipo de Vendedor desconhecido no banco de dados: " + dbData);
        };
    }
}
