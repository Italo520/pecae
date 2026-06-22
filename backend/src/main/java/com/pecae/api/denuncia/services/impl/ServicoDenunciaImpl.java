package com.pecae.api.denuncia.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.denuncia.dtos.request.CriarDenunciaRequest;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.Denuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.mappers.MapperDenuncia;
import com.pecae.api.denuncia.repositories.RepositorioDenuncia;
import com.pecae.api.denuncia.services.IServicoDenuncia;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServicoDenunciaImpl implements IServicoDenuncia {

    private final RepositorioDenuncia repositorioDenuncia;
    private final UsuarioRepository usuarioRepository;
    private final MapperDenuncia mapperDenuncia;

    @Override
    @Transactional
    public RespostaDenuncia submeterDenuncia(UUID reporterId, CriarDenunciaRequest request) {
        Usuario reporter = usuarioRepository.findById(reporterId)
            .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário denunciante não encontrado."));

        Denuncia denuncia = Denuncia.builder()
            .denunciante(reporter)
            .tipoAlvo(request.tipoAlvo())
            .idAlvo(request.idAlvo())
            .categoria(request.categoria())
            .descricao(request.descricao())
            .status(StatusDenuncia.PENDENTE)
            .build();

        Denuncia denunciaSalva = repositorioDenuncia.save(denuncia);
        log.info("Denúncia criada com sucesso - ID: {}, Alvo: {} (ID: {}), Categoria: {}",
            denunciaSalva.getId(), denunciaSalva.getTipoAlvo(), denunciaSalva.getIdAlvo(), denunciaSalva.getCategoria());

        return mapperDenuncia.paraResposta(denunciaSalva);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaDenuncia> listarMinhasDenuncias(UUID reporterId, Pageable pageable) {
        return repositorioDenuncia.buscarPorDenuncianteId(reporterId, pageable)
            .map(mapperDenuncia::paraResposta);
    }
}
