package com.pecae.api.ad.entities;

import com.pecae.api.ad.entities.enums.PlacementAd;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa o Criativo (o banner com sua imagem e links) associado a uma campanha.
 */
@Entity
@Table(name = "ad_creatives")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriativoAd {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private CampanhaAd campanha;

    @Column(name = "titulo_alt", nullable = false)
    private String tituloAlt;

    @Column(name = "url_imagem", nullable = false, columnDefinition = "TEXT")
    private String urlImagem;

    @Column(name = "url_destino", nullable = false, columnDefinition = "TEXT")
    private String urlDestino;

    @Column(name = "texto_cta")
    private String textoCta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlacementAd placement;

    @Column(nullable = false)
    @Builder.Default
    private int prioridade = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
