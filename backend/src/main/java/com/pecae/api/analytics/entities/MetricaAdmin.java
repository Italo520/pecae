package com.pecae.api.analytics.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_metrics")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricaAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_date", nullable = false, unique = true)
    private LocalDate dataReferencia;

    @Column(name = "dau")
    private Integer activeUsers; // Daily Active Users

    @Column(name = "total_listings")
    private Integer totalAnuncios;

    @Column(name = "total_revenue")
    private BigDecimal receitaTotal;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
