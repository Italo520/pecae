package com.pecae.api.catalogo.services;

import com.pecae.api.catalogo.dtos.*;
import java.util.List;
import java.util.UUID;

public interface CatalogoService {
    // Consultas em cascata (leitura pública)
    List<RespostaMarca> obterTodasMarcas();
    List<RespostaModelo> obterModelosPorMarca(UUID marcaId);
    List<RespostaVersao> obterVersoesPorModelo(UUID modeloId);
    List<RespostaAno> obterAnosPorVersao(UUID versaoId);
    List<RespostaCategoriaPeca> obterCategoriasRaiz();
    List<RespostaCategoriaPeca> obterSubcategorias(UUID paiId);
    List<RespostaCatalogoPeca> obterPecasPorVersao(UUID versaoId);

    // CRUD Admin
    RespostaMarca criarMarca(CriarMarcaRequest request);
    RespostaModelo criarModelo(CriarModeloRequest request);
    RespostaVersao criarVersao(CriarVersaoRequest request);
    RespostaCategoriaPeca criarCategoriaPeca(CriarCategoriaPecaRequest request);
    void desativarMarca(UUID id);
    void desativarModelo(UUID id);
}
