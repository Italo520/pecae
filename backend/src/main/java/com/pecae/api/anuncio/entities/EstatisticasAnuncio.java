package com.pecae.api.anuncio.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "listing_stats")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticasAnuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false, unique = true)
    private Anuncio anuncio;

    @Column(name = "views_7d", nullable = false)
    @Builder.Default
    private Integer visualizacoes7d = 0;

    @Column(name = "views_30d", nullable = false)
    @Builder.Default
    private Integer visualizacoes30d = 0;

    @Column(name = "views_90d", nullable = false)
    @Builder.Default
    private Integer visualizacoes90d = 0;

    @Column(name = "chats_initiated_30d", nullable = false)
    @Builder.Default
    private Integer chatsIniciados30d = 0;

    @Column(name = "conversion_rate", nullable = false)
    @Builder.Default
    private Double taxaConversao = 0.0;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculadoEm;
}
