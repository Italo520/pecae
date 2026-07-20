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
 * Entidade que audita a aceitação dos Termos de Uso e Política de Privacidade do usuário (LGPD).
 */
@Entity
@Table(name = "terms_acceptances")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AceiteTermos {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @Column(name = "user_id", nullable = false)
    
    private UUID usuarioId;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(nullable = false, length = 45)
    private String ip;

    @Column(name = "user_agent", columnDefinition = "TEXT", nullable = false)
    private String userAgent;

    @CreationTimestamp
    @Column(name = "accepted_at", nullable = false, updatable = false)
    private LocalDateTime aceitoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Usuario usuario;
}
