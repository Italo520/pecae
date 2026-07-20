package com.pecae.api.denuncia.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorStatusDenuncia implements AttributeConverter<StatusDenuncia, String> {

    @Override
    public String convertToDatabaseColumn(StatusDenuncia attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case PENDENTE -> "PENDING";
            case EM_ANALISE -> "INVESTIGATING";
            case RESOLVIDA -> "RESOLVED";
            case DESCARTADA -> "REJECTED";
        };
    }

    @Override
    public StatusDenuncia convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "PENDING" -> StatusDenuncia.PENDENTE;
            case "INVESTIGATING" -> StatusDenuncia.EM_ANALISE;
            case "RESOLVED" -> StatusDenuncia.RESOLVIDA;
            case "REJECTED" -> StatusDenuncia.DESCARTADA;
            default -> throw new IllegalArgumentException("Status de Denúncia desconhecido no banco de dados: " + dbData);
        };
    }
}
