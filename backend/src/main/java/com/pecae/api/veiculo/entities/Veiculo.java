package com.pecae.api.veiculo.entities;


import com.pecae.api.catalogo.entities.enums.ConversorTipoCombustivel;
import com.pecae.api.catalogo.entities.enums.TipoCombustivel;
import com.pecae.api.veiculo.entities.enums.ConversorStatusVeiculo;
import com.pecae.api.veiculo.entities.enums.StatusVeiculo;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnTransformer;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE vehicles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Veiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private PerfilVendedor perfilVendedor;

    @Column(name = "marca_nome", nullable = false)
    private String marcaNome;

    @Column(name = "modelo_nome", nullable = false)
    private String modeloNome;

    @Column(name = "ano_nome", nullable = false)
    private String anoNome;

    @Column(name = "versao_nome")
    private String versaoNome;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "available_parts", columnDefinition = "jsonb", nullable = false)
    @ColumnTransformer(write = "?::jsonb")
    @Builder.Default
    private List<String> pecasDisponiveis = new ArrayList<>();

    @Column(name = "plate", length = 20)
    private String placa;

    @Column(name = "color", nullable = false, length = 50)
    private String cor;

    @Column(name = "city", nullable = false, length = 100)
    private String cidade;

    @Column(name = "state", nullable = false, length = 2)
    private String estado;

    @Column(name = "lat")
    private Double latitude;

    @Column(name = "lng")
    private Double longitude;

    @Column(name = "observations", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "status", columnDefinition = "VehicleStatus")
    @ColumnTransformer(write = "?::\"VehicleStatus\"")
    @Convert(converter = ConversorStatusVeiculo.class)
    @Builder.Default
    private StatusVeiculo status = StatusVeiculo.RASCUNHO;

    @Column(name = "fuel_type", columnDefinition = "FuelType")
    @ColumnTransformer(write = "?::\"FuelType\"")
    @Convert(converter = ConversorTipoCombustivel.class)
    private TipoCombustivel tipoCombustivel;

    @Column(name = "mileage")
    private Integer quilometragem;

    @OneToMany(mappedBy = "veiculo", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FotoVeiculo> fotos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;

    @Column(name = "deleted_at")
    private LocalDateTime deletadoEm;
}
