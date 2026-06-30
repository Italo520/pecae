package com.pecae.api.comprador.entities;

import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciasNotificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private boolean pushHabilitado = true;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailHabilitado = true;

    @Column(name = "in_app_enabled", nullable = false)
    @Builder.Default
    private boolean inAppHabilitado = true;

    @Column(name = "push_token", columnDefinition = "TEXT")
    private String tokenPush;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
