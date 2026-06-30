package com.pecae.api.catalogo.services.impl;

import com.pecae.api.catalogo.dtos.*;
import com.pecae.api.catalogo.entities.*;
import com.pecae.api.catalogo.mappers.ICatalogoMapper;
import com.pecae.api.catalogo.repositories.*;
import com.pecae.api.catalogo.services.CatalogoService;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogoServiceImpl implements CatalogoService {

    private final MarcaVeiculoRepository marcaVeiculoRepository;
    private final ModeloVeiculoRepository modeloVeiculoRepository;
    private final VersaoVeiculoRepository versaoVeiculoRepository;
    private final AnoVeiculoRepository anoVeiculoRepository;
    private final CategoriaPecaRepository categoriaPecaRepository;
    private final CatalogoPecaRepository catalogoPecaRepository;
    private final ICatalogoMapper catalogoMapper;

    // --- LEITURA PÚBLICA (Com Cache) ---

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-brands")
    public List<RespostaMarca> obterTodasMarcas() {
        log.debug("Buscando marcas do catálogo (cache miss)");
        List<MarcaVeiculo> marcas = marcaVeiculoRepository.findAllByAtivoTrueOrderByNomeAsc();
        return catalogoMapper.toBrandResponseList(marcas);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-models", key = "#marcaId")
    public List<RespostaModelo> obterModelosPorMarca(UUID marcaId) {
        log.debug("Buscando modelos do catálogo para a marca {} (cache miss)", marcaId);
        if (!marcaVeiculoRepository.existsById(marcaId)) {
            throw new ExcecaoRecursoNaoEncontrado("Marca não encontrada com ID: " + marcaId);
        }
        List<ModeloVeiculo> modelos = modeloVeiculoRepository.findAllByMarcaIdAndAtivoTrueOrderByNomeAsc(marcaId);
        return catalogoMapper.toModelResponseList(modelos);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-versions", key = "#modeloId")
    public List<RespostaVersao> obterVersoesPorModelo(UUID modeloId) {
        log.debug("Buscando versões do catálogo para o modelo {} (cache miss)", modeloId);
        if (!modeloVeiculoRepository.existsById(modeloId)) {
            throw new ExcecaoRecursoNaoEncontrado("Modelo não encontrado com ID: " + modeloId);
        }
        List<VersaoVeiculo> versoes = versaoVeiculoRepository.findAllByModeloIdAndAtivoTrueOrderByNomeAsc(modeloId);
        return catalogoMapper.toVersionResponseList(versoes);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-years", key = "#versaoId")
    public List<RespostaAno> obterAnosPorVersao(UUID versaoId) {
        log.debug("Buscando anos do catálogo para a versão {} (cache miss)", versaoId);
        if (!versaoVeiculoRepository.existsById(versaoId)) {
            throw new ExcecaoRecursoNaoEncontrado("Versão não encontrada com ID: " + versaoId);
        }
        List<AnoVeiculo> anos = anoVeiculoRepository.findAllByVersaoIdOrderByAnoDesc(versaoId);
        return catalogoMapper.toYearResponseList(anos);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-categories-root")
    public List<RespostaCategoriaPeca> obterCategoriasRaiz() {
        log.debug("Buscando categorias raiz de peças (cache miss)");
        List<CategoriaPeca> categorias = categoriaPecaRepository.findAllByOrderByNomeAsc();
        return catalogoMapper.toCategoryResponseList(categorias);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-categories-sub", key = "#paiId")
    public List<RespostaCategoriaPeca> obterSubcategorias(UUID paiId) {
        log.debug("Buscando subcategorias para a categoria pai {} (cache miss)", paiId);
        if (!categoriaPecaRepository.existsById(paiId)) {
            throw new ExcecaoRecursoNaoEncontrado("Categoria pai não encontrada com ID: " + paiId);
        }
        List<CategoriaPeca> subcategorias = new java.util.ArrayList<>();
        return catalogoMapper.toCategoryResponseList(subcategorias);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "catalog-parts", key = "#versaoId")
    public List<RespostaCatalogoPeca> obterPecasPorVersao(UUID versaoId) {
        log.debug("Buscando catálogo de peças para a versão de veículo {} (cache miss)", versaoId);
        if (!versaoVeiculoRepository.existsById(versaoId)) {
            throw new ExcecaoRecursoNaoEncontrado("Versão não encontrada com ID: " + versaoId);
        }
        List<CatalogoPeca> pecas = catalogoPecaRepository.findAllByVersaoIdAndAtivoTrue(versaoId);
        return catalogoMapper.toPartCatalogResponseList(pecas);
    }

    // --- CRUD ADMIN (Evict Cache) ---

    @Override
    @Transactional
    @CacheEvict(value = "catalog-brands", allEntries = true)
    public RespostaMarca criarMarca(CriarMarcaRequest request) {
        log.info("Criando nova marca: {}", request.nome());
        if (marcaVeiculoRepository.findByNomeIgnoreCase(request.nome()).isPresent()) {
            throw new ExcecaoNegocio("Já existe uma marca com este nome", HttpStatus.CONFLICT);
        }
        MarcaVeiculo marca = catalogoMapper.toEntity(request);
        marca = marcaVeiculoRepository.save(marca);
        return catalogoMapper.toBrandResponse(marca);
    }

    @Override
    @Transactional
    @CacheEvict(value = "catalog-models", key = "#request.marcaId()")
    public RespostaModelo criarModelo(CriarModeloRequest request) {
        log.info("Criando novo modelo: {} para a marca {}", request.nome(), request.marcaId());
        MarcaVeiculo marca = marcaVeiculoRepository.findById(request.marcaId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Marca não encontrada com ID: " + request.marcaId()));

        ModeloVeiculo modelo = catalogoMapper.toEntity(request);
        modelo.setMarca(marca);
        modelo = modeloVeiculoRepository.save(modelo);
        return catalogoMapper.toModelResponse(modelo);
    }

    @Override
    @Transactional
    @CacheEvict(value = "catalog-versions", key = "#request.modeloId()")
    public RespostaVersao criarVersao(CriarVersaoRequest request) {
        log.info("Criando nova versão: {} para o modelo {}", request.nome(), request.modeloId());
        ModeloVeiculo modelo = modeloVeiculoRepository.findById(request.modeloId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Modelo não encontrado com ID: " + request.modeloId()));

        VersaoVeiculo versao = catalogoMapper.toEntity(request);
        versao.setModelo(modelo);
        versao = versaoVeiculoRepository.save(versao);
        return catalogoMapper.toVersionResponse(versao);
    }

    @Override
    @Transactional
    @CacheEvict(value = "catalog-categories-root", allEntries = true)
    public RespostaCategoriaPeca criarCategoriaPeca(CriarCategoriaPecaRequest request) {
        log.info("Criando nova categoria de peça: {}", request.nome());

        CategoriaPeca pai = null;

        CategoriaPeca categoria = catalogoMapper.toEntity(request);
        categoria = categoriaPecaRepository.save(categoria);

        return catalogoMapper.toCategoryResponse(categoria);
    }

    @Override
    @Transactional
    @CacheEvict(value = "catalog-brands", allEntries = true)
    public void desativarMarca(UUID id) {
        log.info("Desativando marca: {}", id);
        MarcaVeiculo marca = marcaVeiculoRepository.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Marca não encontrada com ID: " + id));
        marca.setAtivo(false);
        marcaVeiculoRepository.save(marca);
    }

    @Override
    @Transactional
    @CacheEvict(value = "catalog-models", allEntries = true)
    public void desativarModelo(UUID id) {
        log.info("Desativando modelo: {}", id);
        ModeloVeiculo modelo = modeloVeiculoRepository.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Modelo não encontrado com ID: " + id));
        modelo.setAtivo(false);
        modeloVeiculoRepository.save(modelo);
    }
}
