package com.pecae.api.ad.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entidade que representa um Anunciante (patrocinador externo) na plataforma.
 */
@Entity
@Table(name = "advertisers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Anunciante {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @Column(name = "nome_empresa", nullable = false)
    private String nomeEmpresa;

    @Column(name = "nome_contato")
    private String nomeContato;

    @Column(name = "email_contato")
    private String emailContato;

    @Column(name = "telefone_contato")
    private String telefoneContato;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @OneToMany(mappedBy = "anunciante", fetch = FetchType.LAZY)
    private List<CampanhaAd> campanhas;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadoEm;
}
