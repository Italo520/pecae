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
 * Entidade que representa os tokens de recuperação/redefinição de senha de uso único.
 */
@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenRedefinicaoSenha {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @Column(name = "user_id", nullable = false)
    
    private UUID usuarioId;

    @Column(name = "token_hash", columnDefinition = "TEXT", nullable = false)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "used_at")
    private LocalDateTime utilizadoEm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Usuario usuario;
}
