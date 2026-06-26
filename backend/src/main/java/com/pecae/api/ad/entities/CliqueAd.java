package com.pecae.api.ad.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que registra de forma analítica cada clique realizado em um criativo.
 */
@Entity
@Table(name = "ad_clicks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CliqueAd {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creative_id", nullable = false)
    private CriativoAd criativo;

    @Column(name = "ip_usuario", length = 100)
    private String ipUsuario;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
