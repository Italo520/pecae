package com.pecae.api.chat.entities;

import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.veiculo.entities.Veiculo;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "chat_rooms", indexes = {
    @Index(name = "idx_chat_rooms_buyer", columnList = "buyer_id"),
    @Index(name = "idx_chat_rooms_seller", columnList = "seller_id"),
    @Index(name = "idx_chat_rooms_updated", columnList = "updated_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaChat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private Usuario comprador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private Usuario vendedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private Anuncio anuncio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Veiculo veiculo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean ativa = true;

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private Boolean arquivada = false;

    @Column(name = "closed_at")
    private LocalDateTime fechadaEm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadaEm;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime atualizadaEm;

    @OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MensagemChat> mensagens = new ArrayList<>();

    @OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<LeituraSala> leituras = new ArrayList<>();
}
