package com.pecae.api.catalogo.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ConversorSegmentoVeiculo implements AttributeConverter<SegmentoVeiculo, String> {

    @Override
    public String convertToDatabaseColumn(SegmentoVeiculo attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case HATCH -> "HATCH";
            case SEDAN -> "SEDAN";
            case SUV -> "SUV";
            case PICKUP -> "PICKUP";
            case VAN -> "VAN";
            case MOTOCICLETA -> "MOTORCYCLE";
            case CAMINHAO -> "TRUCK";
            case ONIBUS -> "BUS";
            case OUTRO -> "OTHER";
        };
    }

    @Override
    public SegmentoVeiculo convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return switch (dbData) {
            case "HATCH" -> SegmentoVeiculo.HATCH;
            case "SEDAN" -> SegmentoVeiculo.SEDAN;
            case "SUV" -> SegmentoVeiculo.SUV;
            case "PICKUP" -> SegmentoVeiculo.PICKUP;
            case "VAN" -> SegmentoVeiculo.VAN;
            case "MOTORCYCLE" -> SegmentoVeiculo.MOTOCICLETA;
            case "TRUCK" -> SegmentoVeiculo.CAMINHAO;
            case "BUS" -> SegmentoVeiculo.ONIBUS;
            case "OTHER" -> SegmentoVeiculo.OUTRO;
            default -> throw new IllegalArgumentException("Segmento de veículo desconhecido no banco: " + dbData);
        };
    }
}
