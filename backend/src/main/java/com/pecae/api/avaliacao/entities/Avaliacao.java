package com.pecae.api.avaliacao.entities;

import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa a avaliação de um vendedor por um comprador.
 */
@Entity
@Table(name = "reviews", uniqueConstraints = {
    @UniqueConstraint(name = "uq_reviews_reviewer_seller", columnNames = {"reviewer_id", "seller_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    // Usuário que fez a avaliação (Avaliador)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Usuario avaliador;

    // Vendedor que recebeu a avaliação (Avaliado)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private PerfilVendedor vendedor;

    @Column(name = "rating", nullable = false)
    private Integer nota;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comentario;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean deletada = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadaEm;
}
