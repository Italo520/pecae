package com.pecae.api.anuncio.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "listing_views")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisualizacaoAnuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Anuncio anuncio;

    @Column(name = "ip_hash", nullable = false, length = 64, columnDefinition = "CHAR(64)")
    private String hashIp;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime visto;
}
