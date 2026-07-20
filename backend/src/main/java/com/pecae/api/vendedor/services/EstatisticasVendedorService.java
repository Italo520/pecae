package com.pecae.api.vendedor.services;

import com.pecae.api.vendedor.entities.PerfilVendedor;

import java.util.UUID;

public interface EstatisticasVendedorService {
    void inicializarEstatisticas(PerfilVendedor perfilVendedor);
    void recalcularAvaliacao(UUID perfilVendedorId);
}
