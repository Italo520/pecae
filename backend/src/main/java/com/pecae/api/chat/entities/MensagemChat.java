package com.pecae.api.chat.entities;

import com.pecae.api.usuario.entities.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_chat_messages_room_created", columnList = "room_id, created_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensagemChat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private SalaChat sala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private Usuario remetente;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean deletada = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadaEm;
}
