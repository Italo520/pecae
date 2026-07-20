package com.pecae.api.vendedor.services.impl;

import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.entities.EstatisticasVendedor;
import com.pecae.api.vendedor.repositories.EstatisticasVendedorRepository;
import com.pecae.api.vendedor.services.EstatisticasVendedorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class EstatisticasVendedorServiceImpl implements EstatisticasVendedorService {

    private final EstatisticasVendedorRepository estatisticasVendedorRepository;

    @Override
    @Transactional
    public void inicializarEstatisticas(PerfilVendedor perfilVendedor) {
        log.info("Inicializando estatísticas do vendedor para o perfilVendedorId: {}", perfilVendedor.getId());
        EstatisticasVendedor estatisticas = EstatisticasVendedor.builder()
                .perfilVendedor(perfilVendedor)
                .totalAnuncios(0)
                .anunciosAtivos(0)
                .mediaAvaliacao(0.0)
                .totalAvaliacoes(0)
                .build();

        estatisticasVendedorRepository.save(estatisticas);
    }

    @Override
    @Transactional
    public void recalcularAvaliacao(UUID perfilVendedorId) {
        log.info("Recalculando avaliação para o perfilVendedorId: {}", perfilVendedorId);
        // FIXME: A ser implementado quando a funcionalidade de avaliações for integrada.
        // Buscar todas as avaliações deste vendedor e calcular a média.
    }
}
