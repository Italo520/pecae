package com.pecae.api.veiculo.services.impl;

import com.pecae.api.compartilhado.armazenamento.ServicoArmazenamento;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.veiculo.dtos.RespostaFotoVeiculo;
import com.pecae.api.veiculo.entities.FotoVeiculo;
import com.pecae.api.veiculo.entities.Veiculo;
import com.pecae.api.veiculo.entities.enums.TipoFoto;
import com.pecae.api.veiculo.jobs.JobProcessamentoFoto;
import com.pecae.api.veiculo.mappers.MapperVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioFotoVeiculo;
import com.pecae.api.veiculo.repositories.RepositorioVeiculo;
import com.pecae.api.veiculo.services.IServicoFotoVeiculo;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.repositories.PerfilVendedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServicoFotoVeiculoImpl implements IServicoFotoVeiculo {

    private final RepositorioVeiculo repositorioVeiculo;
    private final RepositorioFotoVeiculo repositorioFotoVeiculo;
    private final PerfilVendedorRepository perfilVendedorRepository;
    private final ServicoArmazenamento servicoArmazenamento;
    private final JobProcessamentoFoto jobProcessamentoFoto;
    private final MapperVeiculo mapperVeiculo;

    @Override
    @Transactional(readOnly = true)
    public List<RespostaFotoVeiculo> listarFotos(UUID usuarioId, UUID veiculoId) {
        log.info("Listando fotos do veículo: {} para o usuário: {}", veiculoId, usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        Veiculo veiculo = repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfilVendedor.getId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado ou não pertence a este vendedor."));

        return repositorioFotoVeiculo.findAllByVeiculoIdOrderByOrdemAsc(veiculo.getId()).stream()
                .map(mapperVeiculo::paraRespostaFoto)
                .toList();
    }

    @Override
    @Transactional
    public RespostaFotoVeiculo adicionarFoto(UUID usuarioId, UUID veiculoId, MultipartFile arquivo, TipoFoto tipo) {
        log.info("Adicionando foto do tipo: {} para o veículo: {}, usuário: {}", tipo, veiculoId, usuarioId);

        if (arquivo == null || arquivo.isEmpty()) {
            throw new ExcecaoNegocio("Arquivo de foto não enviado ou vazio.");
        }

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        Veiculo veiculo = repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfilVendedor.getId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado ou não pertence a este vendedor."));

        long quantidadeFotos = repositorioFotoVeiculo.countByVeiculoId(veiculo.getId());
        if (quantidadeFotos >= 10) {
            throw new ExcecaoNegocio("Limite máximo de 10 fotos por veículo atingido.");
        }

        // Determina o caminho da foto no Supabase Storage: bucket "vehicles", caminho "veiculoId/UUID.ext"
        String nomeOriginal = arquivo.getOriginalFilename();
        String extensao = "jpg";
        if (nomeOriginal != null && nomeOriginal.contains(".")) {
            extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf(".") + 1);
        }
        String caminho = veiculoId.toString() + "/" + UUID.randomUUID().toString() + "." + extensao;

        // Upload
        String urlFoto = servicoArmazenamento.upload(arquivo, "vehicles", caminho);



        // Criar e salvar
        FotoVeiculo foto = FotoVeiculo.builder()
                .veiculo(veiculo)
                .urlFoto(urlFoto)
                .tipo(tipo)
                .ordem((int) (quantidadeFotos + 1))
                .build();

        FotoVeiculo fotoSalva = repositorioFotoVeiculo.save(foto);

        // Processamento assíncrono
        jobProcessamentoFoto.processarAsync(fotoSalva.getId());

        log.info("Foto adicionada com sucesso. ID: {}", fotoSalva.getId());
        return mapperVeiculo.paraRespostaFoto(fotoSalva);
    }

    @Override
    @Transactional
    public void removerFoto(UUID usuarioId, UUID veiculoId, UUID fotoId) {
        log.info("Removendo foto: {} do veículo: {}, usuário: {}", fotoId, veiculoId, usuarioId);

        PerfilVendedor perfilVendedor = perfilVendedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ExcecaoNegocio("Vendedor não encontrado."));

        Veiculo veiculo = repositorioVeiculo.findByIdAndPerfilVendedorId(veiculoId, perfilVendedor.getId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Veículo não encontrado ou não pertence a este vendedor."));

        FotoVeiculo foto = repositorioFotoVeiculo.findById(fotoId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Foto não encontrada."));

        if (!foto.getVeiculo().getId().equals(veiculo.getId())) {
            throw new ExcecaoNegocio("A foto informada não pertence a este veículo.");
        }

        // Extrai o caminho relativo para exclusão no Supabase (ex: "veiculoId/UUID.ext")
        String url = foto.getUrlFoto();
        String bucket = "vehicles";
        String tag = "/object/public/" + bucket + "/";
        String caminho = url;
        if (url.contains(tag)) {
            caminho = url.substring(url.indexOf(tag) + tag.length());
        }

        try {
            servicoArmazenamento.delete(bucket, caminho);
        } catch (Exception e) {
            log.warn("Erro ao deletar arquivo físico no storage (pode ser ignorado se já deletado): {}", e.getMessage());
        }

        repositorioFotoVeiculo.delete(foto);
        log.info("Foto removida com sucesso. ID: {}", fotoId);
    }
}
