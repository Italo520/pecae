package com.pecae.api.vendedor.entities;

import com.pecae.api.vendedor.entities.enums.StatusVerificacao;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "seller_verifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificacaoVendedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_profile_id", nullable = false, unique = true)
    private PerfilVendedor perfilVendedor;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "VerificationStatus")
    private StatusVerificacao status;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime solicitadoEm;

    @Column(name = "resolved_at")
    private LocalDateTime resolvidoEm;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String motivoRejeicao;
}
