package com.pecae.api.veiculo.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorStatusVeiculo implements AttributeConverter<StatusVeiculo, String> {

    @Override
    public String convertToDatabaseColumn(StatusVeiculo attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case RASCUNHO -> "DRAFT";
            case PENDENTE -> "PENDING";
            case ATIVO -> "ACTIVE";
            case INATIVO -> "INACTIVE";
            case VENDIDO -> "SOLD";
        };
    }

    @Override
    public StatusVeiculo convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "DRAFT" -> StatusVeiculo.RASCUNHO;
            case "PENDING" -> StatusVeiculo.PENDENTE;
            case "ACTIVE" -> StatusVeiculo.ATIVO;
            case "INACTIVE" -> StatusVeiculo.INATIVO;
            case "SOLD" -> StatusVeiculo.VENDIDO;
            default -> throw new IllegalArgumentException("Status de veículo desconhecido no banco: " + dbData);
        };
    }
}
