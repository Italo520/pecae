package com.pecae.api.catalogo.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "part_categories")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaPeca {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    

    private UUID id;

    @Column(name = "name", nullable = false, unique = true)
    private String nome;

    @Column(name = "slug")
    private String slug;

    @Column(name = "icon")
    private String urlIcone;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
