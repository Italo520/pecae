package com.pecae.api.veiculo.entities;

import com.pecae.api.veiculo.entities.enums.ConversorTipoFoto;
import com.pecae.api.veiculo.entities.enums.TipoFoto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicle_photos")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FotoVeiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Veiculo veiculo;

    @Column(name = "url", nullable = false, columnDefinition = "TEXT")
    private String urlFoto;

    @Column(name = "blurhash", columnDefinition = "TEXT")
    private String blurhash;

    @Column(name = "\"order\"", nullable = false)
    @Builder.Default
    private Integer ordem = 0;

    @Column(name = "type", nullable = false)
    @Convert(converter = ConversorTipoFoto.class)
    @Builder.Default
    private TipoFoto tipo = TipoFoto.EXTERIOR;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
