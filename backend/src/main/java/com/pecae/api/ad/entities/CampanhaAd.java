package com.pecae.api.ad.entities;

import com.pecae.api.ad.entities.enums.StatusCampanha;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Entidade que representa uma Campanha de anúncios no sistema.
 */
@Entity
@Table(name = "ad_campaigns")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampanhaAd {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advertiser_id", nullable = false)
    private Anunciante anunciante;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatusCampanha status = StatusCampanha.RASCUNHO;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(name = "orcamento_total")
    private BigDecimal orcamentoTotal;

    @Column(name = "notas_internas", columnDefinition = "TEXT")
    private String notasInternas;

    @OneToMany(mappedBy = "campanha", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CriativoAd> criativos;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
