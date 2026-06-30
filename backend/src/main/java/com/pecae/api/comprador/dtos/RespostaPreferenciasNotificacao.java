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
public class RespostaPreferenciasNotificacao {

    @JsonProperty("id")
    
    private UUID id;

    @JsonProperty("userId")
    
    private UUID usuarioId;

    @JsonProperty("pushEnabled")
    private boolean pushHabilitado;

    @JsonProperty("emailEnabled")
    private boolean emailHabilitado;

    @JsonProperty("inAppEnabled")
    private boolean inAppHabilitado;

    @JsonProperty("pushToken")
    private String tokenPush;

    @JsonProperty("createdAt")
    private LocalDateTime criadoEm;

    @JsonProperty("updatedAt")
    private LocalDateTime atualizadoEm;
}
