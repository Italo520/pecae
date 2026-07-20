package com.pecae.api.usuario.entities.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Conversor JPA para mapear a enumeração StatusUsuario (em português)
 * para os valores correspondentes de string salvos no banco de dados legado (em inglês).
 */
@Converter(autoApply = true)
public class ConversorStatusUsuario implements AttributeConverter<StatusUsuario, String> {

    @Override
    public String convertToDatabaseColumn(StatusUsuario attribute) {
        if (attribute == null) {
            return null;
        }
        return switch (attribute) {
            case PENDENTE_VERIFICACAO -> "PENDING_VERIFICATION";
            case ATIVO -> "ACTIVE";
            case SUSPENSO -> "SUSPENDED";
            case BANIDO -> "BANNED";
            case DELETADO -> "DELETED";
        };
    }

    @Override
    public StatusUsuario convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return switch (dbData.toUpperCase()) {
            case "PENDING_VERIFICATION" -> StatusUsuario.PENDENTE_VERIFICACAO;
            case "ACTIVE" -> StatusUsuario.ATIVO;
            case "SUSPENDED" -> StatusUsuario.SUSPENSO;
            case "BANNED" -> StatusUsuario.BANIDO;
            case "DELETED" -> StatusUsuario.DELETADO;
            default -> throw new IllegalArgumentException("Status de usuário desconhecido no banco de dados: " + dbData);
        };
    }
}
