package com.pecae.api.autenticacao.entities;

import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa os tokens de refresh ativos para controle de sessão do usuário.
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenAtualizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @Column(name = "user_id", nullable = false)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID usuarioId;

    @Column(name = "token_hash", columnDefinition = "TEXT", nullable = false)
    private String tokenHash;

    @Column(nullable = false, length = 45)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "revoked_at")
    private LocalDateTime revogadoEm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Usuario usuario;
}
