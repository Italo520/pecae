package com.pecae.api.catalogo.entities;

import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import com.pecae.api.catalogo.entities.enums.TipoTransmissao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vehicle_versions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersaoVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String nome;

    @Column(name = "fuel_type", nullable = false)
    private TipoCombustivel tipoCombustivel;

    @Column(name = "transmission_type", nullable = false)
    private TipoTransmissao tipoTransmissao;

    @Column(name = "engine_displacement_cc")
    private Integer cilindradaCc;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", nullable = false)
    private ModeloVeiculo modelo;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @OneToMany(mappedBy = "versao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AnoVeiculo> anos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
