package com.pecae.api.comprador.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RespostaPerfilComprador {

    @JsonProperty("id")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID id;

    @JsonProperty("userId")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID usuarioId;

    @JsonProperty("name")
    private String nome;

    @JsonProperty("avatar")
    private String avatar;

    @JsonProperty("createdAt")
    private LocalDateTime criadoEm;

    @JsonProperty("updatedAt")
    private LocalDateTime atualizadoEm;
}
