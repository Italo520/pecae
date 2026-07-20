package com.pecae.api.usuario.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pecae.api.usuario.entities.enums.StatusUsuario;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * DTO de resposta contendo os dados públicos e básicos do perfil do usuário.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    

    private UUID id;

    @JsonProperty("name")
    private String nome;

    private String email;

    @JsonProperty("phone")
    private String telefone;

    @JsonProperty("type")
    private TipoUsuario tipo;

    @JsonProperty("status")
    private StatusUsuario status;

    @JsonProperty("emailVerified")
    private boolean emailVerificado;

    @JsonProperty("phoneVerified")
    private boolean telefoneVerificado;

    private String avatar;

    @JsonProperty("lastActiveAt")
    private LocalDateTime ultimoAcessoEm;

    @JsonProperty("createdAt")
    private LocalDateTime criadoEm;

    @JsonProperty("updatedAt")
    private LocalDateTime atualizadoEm;

    @JsonProperty("hasProfile")
    private boolean hasProfile;
}
