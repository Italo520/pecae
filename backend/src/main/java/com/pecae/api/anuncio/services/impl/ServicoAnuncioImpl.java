package com.pecae.api.anuncio.services.impl;

import com.pecae.api.anuncio.dtos.*;
import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.entities.EstatisticasAnuncio;
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.jobs.JobVisualizacaoAnuncio;
import com.pecae.api.anuncio.mappers.MapperAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioEstatisticasAnuncio;
import com.pecae.api.anuncio.services.IServicoAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.enums.StatusVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.vendedor.entities.EstatisticasVendedor;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicoAnuncioImpl implements IServicoAnuncio {

    private final RepositorioAnuncio repositorioAnuncio;
    private final RepositorioEstatisticasAnuncio repositorioEstatisticasAnuncio;
    private final PerfilVendedorRepository perfilVendedorRepository;
    private final RepositorioVeiculo repositorioVeiculo;
    private final MapperAnuncio mapperAnuncio;
    private final MaquinaEstadoAnuncio maquinaEstado;
    private final JobVisualizacaoAnuncio jobVisualizacaoAnuncio;

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaAnuncio> listarPublicos(FiltrosAnuncioQuery filtros) {
        Pageable pageable = PageRequest.of(filtros.pagina(), filtros.tamanho());
        Page<Anuncio> anuncios = repositorioAnuncio.buscarPublicados(
            filtros.marcaId(),
            filtros.modeloId(),
            filtros.cidade(),
            filtros.estado(),
            filtros.search(),
            pageable
        );
        return anuncios.map(mapperAnuncio::paraResposta);
    }

    @Override
    @Transactional
    public RespostaDetalheAnuncio buscarDetalhe(UUID anuncioId, String ip) {
        Anuncio anuncio = repositorioAnuncio.findByIdAndStatus(anuncioId, StatusAnuncio.PUBLICADO)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anúncio publicado não encontrado."));

        // RN-LGPD: Vendedor deletado não exibe anúncio
        if (anuncio.getPerfilVendedor().getDeletadoEm() != null) {
            throw new ExcecaoRecursoNaoEncontrado("Anúncio publicado não encontrado.");
        }

        // Registrar visualização assincronamente (deduplicada por IP)
        jobVisualizacaoAnuncio.registrarVisualizacaoAsync(anuncioId, ip);

        return mapperAnuncio.paraRespostaDetalhe(anuncio);
    }

    @Override
    @Transactional
    public RespostaDetalheAnuncio criar(UUID usuarioId, CriarAnuncioRequest request) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Veiculo veiculo = repositorioVeiculo.findById(request.veiculoId())
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado."));

        if (!veiculo.getPerfilVendedor().getId().equals(perfilVendedor.getId())) {
            throw new ExcecaoNegocio("Este veículo não pertence ao seu perfil.");
        }

        Anuncio anuncio = Anuncio.builder()
            .perfilVendedor(perfilVendedor)
            .veiculo(veiculo)
            .titulo(request.titulo())
            .descricao(request.descricao())
            .status(StatusAnuncio.PENDENTE) // RN14: status inicial
            .visualizacoes(0)
            .totalFavoritos(0)
            .duplicado(false)
            .patrocinadoAtivo(false)
            .build();

        Anuncio anuncioSalvo = repositorioAnuncio.save(anuncio);

        // Criar estatísticas associadas vazias
        EstatisticasAnuncio stats = EstatisticasAnuncio.builder()
            .anuncio(anuncioSalvo)
            .visualizacoes7d(0)
            .visualizacoes30d(0)
            .visualizacoes90d(0)
            .chatsIniciados30d(0)
            .taxaConversao(0.0)
            .calculadoEm(LocalDateTime.now())
            .build();
        repositorioEstatisticasAnuncio.save(stats);

        anuncioSalvo.setEstatisticas(stats);

        // Incrementar total de anúncios nas estatísticas do vendedor
        EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
        if (statsVendedor != null) {
            statsVendedor.setTotalAnuncios(statsVendedor.getTotalAnuncios() + 1);
            perfilVendedorRepository.save(perfilVendedor);
        }

        log.info("Anúncio criado com sucesso: {} para o vendedor: {}", anuncioSalvo.getId(), perfilVendedor.getId());

        return mapperAnuncio.paraRespostaDetalhe(anuncioSalvo);
    }

    @Override
    @Transactional
    public RespostaDetalheAnuncio atualizar(UUID usuarioId, UUID anuncioId, AtualizarAnuncioRequest request) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Anuncio anuncio = repositorioAnuncio.findByIdAndPerfilVendedorId(anuncioId, perfilVendedor.getId())
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anúncio não encontrado ou não pertence ao seu perfil."));

        // RN10: Se o anúncio está publicado e foi editado, volta para PENDENTE
        if (anuncio.getStatus() == StatusAnuncio.PUBLICADO) {
            maquinaEstado.validarTransicao(StatusAnuncio.PUBLICADO, StatusAnuncio.PENDENTE);
            anuncio.setStatus(StatusAnuncio.PENDENTE);
            anuncio.setPublicadoEm(null);

            // Decrementar anúncios ativos do vendedor
            EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
            if (statsVendedor != null) {
                statsVendedor.setAnunciosAtivos(Math.max(0, statsVendedor.getAnunciosAtivos() - 1));
                perfilVendedorRepository.save(perfilVendedor);
            }
        }

        if (request.titulo() != null && !request.titulo().isBlank()) {
            anuncio.setTitulo(request.titulo());
        }
        if (request.descricao() != null) {
            anuncio.setDescricao(request.descricao());
        }

        Anuncio anuncioAtualizado = repositorioAnuncio.save(anuncio);
        log.info("Anúncio {} atualizado pelo vendedor: {}", anuncioId, perfilVendedor.getId());

        return mapperAnuncio.paraRespostaDetalhe(anuncioAtualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaAnuncio> listarMeusAnuncios(UUID usuarioId, Pageable pageable) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Page<Anuncio> anuncios = repositorioAnuncio.findAllByPerfilVendedorId(perfilVendedor.getId(), pageable);
        return anuncios.map(mapperAnuncio::paraResposta);
    }

    private Anuncio obterAnuncioPorIdOuVeiculoId(UUID id, UUID perfilVendedorId) {
        return repositorioAnuncio.findByIdAndPerfilVendedorId(id, perfilVendedorId)
            .orElseGet(() -> repositorioAnuncio.findByVeiculoIdAndPerfilVendedorId(id, perfilVendedorId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anúncio não encontrado ou não pertence ao seu perfil.")));
    }

    @Override
    @Transactional
    public void marcarComoVendido(UUID usuarioId, UUID anuncioId) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Anuncio anuncio = obterAnuncioPorIdOuVeiculoId(anuncioId, perfilVendedor.getId());

        if (anuncio.getStatus() == StatusAnuncio.VENDIDO) {
            return; // Idempotência
        }

        maquinaEstado.validarTransicao(anuncio.getStatus(), StatusAnuncio.VENDIDO);

        StatusAnuncio statusAnterior = anuncio.getStatus();

        // Atualizar status do anúncio
        anuncio.setStatus(StatusAnuncio.VENDIDO);
        anuncio.setVendidoEm(LocalDateTime.now());
        repositorioAnuncio.save(anuncio);

        // Atualizar status do veículo para VENDIDO
        Veiculo veiculo = anuncio.getVeiculo();
        if (veiculo != null) {
            veiculo.setStatus(StatusVeiculo.VENDIDO);
            repositorioVeiculo.save(veiculo);
        }

        // Atualizar EstatisticasVendedor
        EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
        if (statsVendedor != null) {
            if (statusAnterior == StatusAnuncio.PUBLICADO) {
                statsVendedor.setAnunciosAtivos(Math.max(0, statsVendedor.getAnunciosAtivos() - 1));
            }
            perfilVendedorRepository.save(perfilVendedor);
        }

        log.info("Anúncio {} marcado como VENDIDO. Veículo {} atualizado para VENDIDO.", anuncio.getId(), veiculo != null ? veiculo.getId() : null);
    }

    @Override
    @Transactional
    public void remover(UUID usuarioId, UUID anuncioId) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Anuncio anuncio = obterAnuncioPorIdOuVeiculoId(anuncioId, perfilVendedor.getId());

        maquinaEstado.validarTransicao(anuncio.getStatus(), StatusAnuncio.EXPIRADO);

        StatusAnuncio statusAnterior = anuncio.getStatus();

        anuncio.setStatus(StatusAnuncio.EXPIRADO);
        repositorioAnuncio.save(anuncio);

        repositorioAnuncio.delete(anuncio); // Soft delete via @SQLDelete

        // Atualizar EstatisticasVendedor
        EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
        if (statsVendedor != null) {
            if (statusAnterior == StatusAnuncio.PUBLICADO) {
                statsVendedor.setAnunciosAtivos(Math.max(0, statsVendedor.getAnunciosAtivos() - 1));
            }
            statsVendedor.setTotalAnuncios(Math.max(0, statsVendedor.getTotalAnuncios() - 1));
            perfilVendedorRepository.save(perfilVendedor);
        }

        log.info("Anúncio {} removido (soft-delete) pelo vendedor: {}", anuncio.getId(), perfilVendedor.getId());
    }

    @Override
    @Transactional
    public void pausar(UUID usuarioId, UUID anuncioId) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Anuncio anuncio = obterAnuncioPorIdOuVeiculoId(anuncioId, perfilVendedor.getId());

        maquinaEstado.validarTransicao(anuncio.getStatus(), StatusAnuncio.PAUSADO);

        StatusAnuncio statusAnterior = anuncio.getStatus();
        anuncio.setStatus(StatusAnuncio.PAUSADO);
        repositorioAnuncio.save(anuncio);

        // Atualizar status do veículo para INATIVO
        Veiculo veiculo = anuncio.getVeiculo();
        if (veiculo != null) {
            veiculo.setStatus(StatusVeiculo.INATIVO);
            repositorioVeiculo.save(veiculo);
        }

        // Atualizar EstatisticasVendedor
        EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
        if (statsVendedor != null) {
            if (statusAnterior == StatusAnuncio.PUBLICADO) {
                statsVendedor.setAnunciosAtivos(Math.max(0, statsVendedor.getAnunciosAtivos() - 1));
            }
            perfilVendedorRepository.save(perfilVendedor);
        }

        log.info("Anúncio {} pausado pelo vendedor: {}", anuncio.getId(), perfilVendedor.getId());
    }

    @Override
    @Transactional
    public void republicar(UUID usuarioId, UUID anuncioId) {
        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ExcecaoNegocio("Você não possui um perfil de vendedor."));

        Anuncio anuncio = obterAnuncioPorIdOuVeiculoId(anuncioId, perfilVendedor.getId());

        maquinaEstado.validarTransicao(anuncio.getStatus(), StatusAnuncio.PENDENTE);

        anuncio.setStatus(StatusAnuncio.PENDENTE);
        anuncio.setPublicadoEm(null);
        repositorioAnuncio.save(anuncio);

        // Atualizar status do veículo para PENDENTE
        Veiculo veiculo = anuncio.getVeiculo();
        if (veiculo != null) {
            veiculo.setStatus(StatusVeiculo.PENDENTE);
            repositorioVeiculo.save(veiculo);
        }

        log.info("Anúncio {} republicado e aguardando moderação. Vendedor: {}", anuncio.getId(), perfilVendedor.getId());
    }

    @Override
    @Transactional
    public void moderar(UUID anuncioId, StatusAnuncio novoStatus) {
        Anuncio anuncio = repositorioAnuncio.findById(anuncioId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anúncio não encontrado."));

        maquinaEstado.validarTransicao(anuncio.getStatus(), novoStatus);

        StatusAnuncio statusAnterior = anuncio.getStatus();
        anuncio.setStatus(novoStatus);

        if (novoStatus == StatusAnuncio.PUBLICADO) {
            anuncio.setPublicadoEm(LocalDateTime.now());
            anuncio.setExpiraEm(LocalDateTime.now().plusDays(30)); // 30 dias por padrão

            // Incrementar anúncios ativos do vendedor
            PerfilVendedor perfilVendedor = anuncio.getPerfilVendedor();
            EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
            if (statsVendedor != null) {
                statsVendedor.setAnunciosAtivos(statsVendedor.getAnunciosAtivos() + 1);
                perfilVendedorRepository.save(perfilVendedor);
            }
        } else if (novoStatus == StatusAnuncio.REJEITADO) {
            // Caso seja rejeitado, se antes estava publicado (improvável por causa do fluxo normal, mas seguro)
            if (statusAnterior == StatusAnuncio.PUBLICADO) {
                PerfilVendedor perfilVendedor = anuncio.getPerfilVendedor();
                EstatisticasVendedor statsVendedor = perfilVendedor.getEstatisticas();
                if (statsVendedor != null) {
                    statsVendedor.setAnunciosAtivos(Math.max(0, statsVendedor.getAnunciosAtivos() - 1));
                    perfilVendedorRepository.save(perfilVendedor);
                }
            }
        }

        repositorioAnuncio.save(anuncio);
        log.info("Anúncio {} moderado com sucesso. Status alterado de {} para {}.", anuncioId, statusAnterior, novoStatus);
    }
}

