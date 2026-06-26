package com.pecae.api.catalogo.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "vehicle_years")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnoVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @Column(name = "year", nullable = false)
    private Integer ano;

    @Column(name = "fipe_code")
    private String codigoFipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id", nullable = false)
    private VersaoVeiculo versao;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
