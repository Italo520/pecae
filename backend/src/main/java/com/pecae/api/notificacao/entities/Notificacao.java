package com.pecae.api.notificacao.entities;

import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.notificacao.entities.enums.TipoNotificacao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa as notificações in-app enviadas aos usuários.
 */
@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "conteudo", columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private TipoNotificacao tipo;

    @Column(name = "action_url")
    private String urlAcao;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean lida = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadaEm;
}
