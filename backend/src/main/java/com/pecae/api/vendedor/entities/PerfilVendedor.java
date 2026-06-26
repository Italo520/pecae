package com.pecae.api.vendedor.entities;

import com.pecae.api.vendedor.entities.enums.TipoVendedor;
import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "seller_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE seller_profiles SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class PerfilVendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "name", nullable = false)
    private String nome;

    @Column(name = "document", nullable = false, unique = true)
    private String documento;

    @Column(name = "phone", nullable = false)
    private String telefone;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String biografia;

    @Column(name = "logo_url")
    private String urlLogo;

    @Column(name = "banner_url")
    private String urlBanner;

    @Column(name = "seller_type", nullable = false)
    private TipoVendedor tipoVendedor;

    @OneToOne(mappedBy = "perfilVendedor", cascade = CascadeType.ALL, orphanRemoval = true)
    private EstatisticasVendedor estatisticas;

    @OneToOne(mappedBy = "perfilVendedor", cascade = CascadeType.ALL, orphanRemoval = true)
    private VerificacaoVendedor verificacao;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;

    @Column(name = "deleted_at")
    private LocalDateTime deletadoEm;
}
