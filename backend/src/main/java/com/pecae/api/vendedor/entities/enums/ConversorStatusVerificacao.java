package com.pecae.api.vendedor.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorStatusVerificacao implements AttributeConverter<StatusVerificacao, String> {

    @Override
    public String convertToDatabaseColumn(StatusVerificacao attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case PENDENTE -> "PENDING";
            case APROVADO -> "APPROVED";
            case REJEITADO -> "REJECTED";
            case NENHUM -> "NONE";
        };
    }

    @Override
    public StatusVerificacao convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "PENDING" -> StatusVerificacao.PENDENTE;
            case "APPROVED" -> StatusVerificacao.APROVADO;
            case "REJECTED" -> StatusVerificacao.REJEITADO;
            case "NONE" -> StatusVerificacao.NENHUM;
            default -> throw new IllegalArgumentException("Status de Verificação desconhecido no banco de dados: " + dbData);
        };
    }
}
