package com.pecae.api.usuario.entities;

import com.pecae.api.usuario.entities.enums.StatusUsuario;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa o registro de identidade de um usuário no sistema.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String nome;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", columnDefinition = "TEXT")
    private String senhaHash;

    @Column(name = "google_id", unique = true)
    private UUID googleId;

    @Column(name = "apple_id", unique = true)
    private UUID appleId;

    @Column(name = "phone", unique = true)
    private String telefone;

    @Column(name = "type", nullable = false)
    private TipoUsuario tipo;

    @Column(name = "status", nullable = false)
    private StatusUsuario status;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerificado;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerificadoEm;

    @Column(name = "phone_verified", nullable = false)
    private boolean telefoneVerificado;

    @Column(name = "phone_verified_at")
    private LocalDateTime telefoneVerificadoEm;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    @Column(name = "last_active_at")
    private LocalDateTime ultimoAcessoEm;

    @Column(name = "deleted_at")
    private LocalDateTime deletadoEm;

    @Column(name = "original_email")
    private String emailOriginal;

    @Column(name = "accepted_terms_at")
    private LocalDateTime termosAceitosEm;

    @Column(name = "accepted_privacy_at")
    private LocalDateTime privacidadeAceitaEm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
