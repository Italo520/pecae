package com.pecae.api.anuncio.entities;

import com.pecae.api.anuncio.entities.enums.ConversorStatusAnuncio;
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "listings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE listings SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Anuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_profile_id", nullable = false)
    private PerfilVendedor perfilVendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Veiculo veiculo;

    @Column(name = "title", nullable = false)
    private String titulo;

    @Column(name = "description", columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "status", nullable = false, columnDefinition = "ListingStatus")
    @org.hibernate.annotations.ColumnTransformer(write = "?::\"ListingStatus\"")
    @Convert(converter = ConversorStatusAnuncio.class)
    @Builder.Default
    private StatusAnuncio status = StatusAnuncio.PENDENTE;

    @Column(name = "views", nullable = false)
    @Builder.Default
    private Integer visualizacoes = 0;

    @Column(name = "favorites_count", nullable = false)
    @Builder.Default
    private Integer totalFavoritos = 0;

    @Column(name = "is_duplicate", nullable = false)
    @Builder.Default
    private Boolean duplicado = false;

    @Column(name = "duplicate_of_id")
    
    private UUID duplicadoDeId;

    @Column(name = "is_sponsored_active", nullable = false)
    @Builder.Default
    private Boolean patrocinadoAtivo = false;

    @Column(name = "published_at")
    private LocalDateTime publicadoEm;

    @Column(name = "expires_at")
    private LocalDateTime expiraEm;

    @Column(name = "sold_at")
    private LocalDateTime vendidoEm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;

    @Column(name = "deleted_at")
    private LocalDateTime deletadoEm;

    @OneToMany(mappedBy = "anuncio", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<VisualizacaoAnuncio> logs = new ArrayList<>();

    @OneToOne(mappedBy = "anuncio", cascade = CascadeType.ALL, orphanRemoval = true)
    private EstatisticasAnuncio estatisticas;
}
