package com.pecae.api.vendedor.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "seller_stats")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticasVendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_profile_id", nullable = false, unique = true)
    private PerfilVendedor perfilVendedor;

    @Builder.Default
    @Column(name = "total_listings", nullable = false)
    private Integer totalAnuncios = 0;

    @Builder.Default
    @Column(name = "active_listings", nullable = false)
    private Integer anunciosAtivos = 0;

    @Builder.Default
    @Column(name = "rating_avg", nullable = false)
    private Double mediaAvaliacao = 0.0;

    @Builder.Default
    @Column(name = "total_reviews", nullable = false)
    private Integer totalAvaliacoes = 0;
}
