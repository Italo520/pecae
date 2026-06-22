package com.pecae.api.anuncio.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class ConversorStatusAnuncio implements AttributeConverter<StatusAnuncio, String> {

    @Override
    public String convertToDatabaseColumn(StatusAnuncio attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case RASCUNHO -> "DRAFT";
            case PENDENTE -> "PENDING";
            case PUBLICADO -> "PUBLISHED";
            case VENDIDO -> "SOLD";
            case EXPIRADO -> "EXPIRED";
            case REJEITADO -> "REJECTED";
        };
    }

    @Override
    public StatusAnuncio convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "DRAFT" -> StatusAnuncio.RASCUNHO;
            case "PENDING" -> StatusAnuncio.PENDENTE;
            case "PUBLISHED" -> StatusAnuncio.PUBLICADO;
            case "SOLD" -> StatusAnuncio.VENDIDO;
            case "EXPIRED" -> StatusAnuncio.EXPIRADO;
            case "REJECTED" -> StatusAnuncio.REJEITADO;
            default -> throw new IllegalArgumentException("Status de anúncio desconhecido no banco: " + dbData);
        };
    }
}
