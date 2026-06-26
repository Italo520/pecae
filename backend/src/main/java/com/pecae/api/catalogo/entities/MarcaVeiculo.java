package com.pecae.api.catalogo.entities;

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
@Table(name = "vehicle_brands")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarcaVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String nome;

    @Column(name = "logo_url")
    private String urlLogo;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @OneToMany(mappedBy = "marca", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ModeloVeiculo> modelos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
