package com.pecae.api.analytics.entities;

import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "seller_metrics", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"seller_id", "reference_date"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricaVendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Usuario vendedor;

    @Column(name = "reference_date", nullable = false)
    private LocalDate dataReferencia;

    @Column(name = "total_views")
    private Integer visualizacoes;

    @Column(name = "total_contacts")
    private Integer contatos;

    @Column(name = "conversion_rate")
    private Double taxaConversao;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
