package com.pecae.api.denuncia.repositories;

import com.pecae.api.denuncia.entities.Denuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface RepositorioDenuncia extends JpaRepository<Denuncia, UUID> {

    Page<Denuncia> findAllByStatus(StatusDenuncia status, Pageable pageable);

    @Query("""
        SELECT d FROM Denuncia d
        JOIN FETCH d.denunciante
        WHERE d.denunciante.id = :denuncianteId
        ORDER BY d.criadaEm DESC
    """)
    Page<Denuncia> buscarPorDenuncianteId(@Param("denuncianteId") UUID denuncianteId, Pageable pageable);
}
