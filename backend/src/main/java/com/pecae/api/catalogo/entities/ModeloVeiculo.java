package com.pecae.api.catalogo.entities;

import com.pecae.api.catalogo.entities.enums.SegmentoVeiculo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "vehicle_models")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModeloVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @Column(name = "name", nullable = false)
    private String nome;

    @Column(name = "segment", nullable = false)
    private SegmentoVeiculo segmento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private MarcaVeiculo marca;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @OneToMany(mappedBy = "modelo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<VersaoVeiculo> versoes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
