package com.pecae.api.usuario.entities;

import com.pecae.api.usuario.entities.enums.PlataformaPush;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa os tokens de notificação push associados a um usuário e plataforma.
 */
@Entity
@Table(
    name = "push_tokens",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "platform"})
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenPush {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @Column(name = "user_id", nullable = false)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID usuarioId;

    @Column(nullable = false)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform")
    private PlataformaPush plataforma;

    @Column(name = "device_info")
    private String infoDispositivo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Usuario usuario;
}
