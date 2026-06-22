package com.pecae.api.notificacao.entities;

import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.notificacao.entities.enums.CanalNotificacao;
import com.pecae.api.notificacao.entities.enums.StatusNotificacao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entidade que registra o histórico de envios e tentativas para canais de notificação externos (Push, Email).
 */
@Entity
@Table(name = "notification_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogNotificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private CanalNotificacao canal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusNotificacao status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String mensagemErro;

    @Column(name = "external_id")
    private String idExterno;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime enviadaEm;
}
