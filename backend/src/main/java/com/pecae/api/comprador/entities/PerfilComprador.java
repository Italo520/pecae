package com.pecae.api.comprador.entities;

import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "buyer_profile")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerfilComprador {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)

    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Usuario usuario;

    @Column(name = "name", nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String avatar;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;

    @Column(name = "deleted_at")
    private LocalDateTime deletadoEm;
}
