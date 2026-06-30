package com.pecae.api.denuncia.entities;

import com.pecae.api.denuncia.entities.enums.CategoriaDenuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.entities.enums.TipoAlvoDenuncia;
import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa uma denúncia feita no sistema.
 */
@Entity
@Table(name = "reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    // Usuário que fez a denúncia
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Usuario denunciante;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TipoAlvoDenuncia tipoAlvo;

    @Column(name = "target_id", nullable = false)
    
    private UUID idAlvo;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private CategoriaDenuncia categoria;

    @Column(name = "description", columnDefinition = "TEXT")
    private String descricao;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StatusDenuncia status = StatusDenuncia.PENDENTE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadaEm;
}
