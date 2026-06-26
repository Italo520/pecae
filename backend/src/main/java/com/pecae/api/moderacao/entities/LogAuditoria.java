package com.pecae.api.moderacao.entities;

import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que registra logs de auditoria para ações de moderação.
 */
@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    // Moderador que tomou a ação
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moderator_id", nullable = false)
    private Usuario moderador;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private AcaoModeracao acao;

    @Column(name = "entity_type", nullable = false)
    private String tipoEntidade;

    @Column(name = "entity_id", nullable = false)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID idEntidade;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String motivo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
