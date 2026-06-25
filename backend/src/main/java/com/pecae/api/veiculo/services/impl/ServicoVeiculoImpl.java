package com.pecae.api.veiculo.services.impl;

import com.pecae.api.catalogo.entities.AnoVeiculo;
import com.pecae.api.catalogo.entities.VersaoVeiculo;
import com.pecae.api.catalogo.repositories.AnoVeiculoRepository;
import com.pecae.api.catalogo.repositories.VersaoVeiculoRepository;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.veiculo.dtos.CriarVeiculoRequest;
import com.pecae.api.veiculo.dtos.AtualizarVeiculoRequest;
import com.pecae.api.veiculo.dtos.RespostaDetalheVeiculo;
import com.pecae.api.veiculo.dtos.RespostaVeiculo;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.enums.StatusVeiculo;
import com.pecae.api.veiculo.mappers.MapperVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.veiculo.services.IServicoVeiculo;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServicoVeiculoImpl implements IServicoVeiculo {

    private final RepositorioVeiculo repositorioVeiculo;
    private final PerfilVendedorRepository perfilVendedorRepository;
    private final VersaoVeiculoRepository versaoVeiculoRepository;
    private final AnoVeiculoRepository anoVeiculoRepository;
    private final MapperVeiculo mapperVeiculo;

    @Override
    @Transactional
    public RespostaDetalheVeiculo criar(UUID usuarioId, CriarVeiculoRequest request) {
        log.info("Iniciando criação de veículo para o usuário: {}", usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado. Crie seu perfil de vendedor antes de cadastrar um veículo."));

        if (request.placa() != null && !request.placa().isBlank()) {
            if (repositorioVeiculo.existsByPlaca(request.placa())) {
                throw new ExcecaoNegocio("Já existe um veículo cadastrado com a placa informada.");
            }
        }

        VersaoVeiculo versao = versaoVeiculoRepository.findById(request.versaoId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Versão de veículo não encontrada."));

        AnoVeiculo ano = anoVeiculoRepository.findById(request.anoId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Ano de fabricação não encontrado."));

        Veiculo veiculo = mapperVeiculo.paraEntidade(request);
        veiculo.setPerfilVendedor(perfilVendedor);
        veiculo.setVersao(versao);
        veiculo.setAnoFabricacao(ano);
        veiculo.setStatus(StatusVeiculo.RASCUNHO);

        if (request.tipoCombustivel() != null) {
            veiculo.setTipoCombustivel(request.tipoCombustivel());
        } else {
            veiculo.setTipoCombustivel(versao.getTipoCombustivel());
        }

        Veiculo veiculoSalvo = repositorioVeiculo.save(veiculo);
        log.info("Veículo criado com sucesso. ID: {}", veiculoSalvo.getId());

        return mapperVeiculo.paraRespostaDetalhe(veiculoSalvo);
    }

    @Override
    @Transactional
    public RespostaDetalheVeiculo atualizar(UUID usuarioId, UUID veiculoId, AtualizarVeiculoRequest request) {
        log.info("Iniciando atualização do veículo: {} para o usuário: {}", veiculoId, usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        Veiculo veiculo = repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfilVendedor.getId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado ou não pertence a este vendedor."));

        if (request.placa() != null && !request.placa().isBlank() && !request.placa().equalsIgnoreCase(veiculo.getPlaca())) {
            if (repositorioVeiculo.existsByPlacaAndIdNot(request.placa(), veiculoId)) {
                throw new ExcecaoNegocio("Já existe outro veículo cadastrado com a placa informada.");
            }
        }

        mapperVeiculo.atualizarEntidadeDoDto(request, veiculo);

        // Se o tipo de combustível estiver presente no request de atualização, atualiza-o
        if (request.tipoCombustivel() != null) {
            veiculo.setTipoCombustivel(request.tipoCombustivel());
        }

        Veiculo veiculoSalvo = repositorioVeiculo.save(veiculo);
        log.info("Veículo atualizado com sucesso. ID: {}", veiculoSalvo.getId());

        return mapperVeiculo.paraRespostaDetalhe(veiculoSalvo);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaVeiculo> listarMeusVeiculos(UUID usuarioId, Pageable pageable) {
        log.info("Listando veículos do usuário: {}", usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        return repositorioVeiculo.findAllByPerfilVendedorId(perfilVendedor.getId(), pageable)
                .map(mapperVeiculo::paraResposta);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaDetalheVeiculo buscarDetalhes(UUID usuarioId, UUID veiculoId) {
        log.info("Buscando detalhes do veículo: {} para o usuário: {}", veiculoId, usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        Veiculo veiculo = repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfilVendedor.getId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado ou não pertence a este vendedor."));

        return mapperVeiculo.paraRespostaDetalhe(veiculo);
    }

    @Override
    @Transactional(readOnly = true)
    public RespostaDetalheVeiculo buscarDetalhesPublico(UUID veiculoId) {
        Veiculo veiculo = repositorioVeiculo.findById(veiculoId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado."));
        return mapperVeiculo.paraRespostaDetalhe(veiculo);
    }

    @Override
    @Transactional
    public void deletar(UUID usuarioId, UUID veiculoId) {
        log.info("Iniciando exclusão lógica do veículo: {} para o usuário: {}", veiculoId, usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        Veiculo veiculo = repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfilVendedor.getId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado ou não pertence a este vendedor."));

        repositorioVeiculo.delete(veiculo);
        log.info("Veículo deletado com sucesso. ID: {}", veiculoId);
    }
}
