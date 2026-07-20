package com.pecae.api.favorito.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.favorito.dtos.request.CriarBuscaSalvaRequest;
import com.pecae.api.favorito.dtos.response.RespostaBuscaSalva;
import com.pecae.api.favorito.entities.BuscaSalva;
import com.pecae.api.favorito.mappers.MapperFavoritoBusca;
import com.pecae.api.favorito.repositories.RepositorioBuscaSalva;
import com.pecae.api.favorito.services.IServicoBuscaSalva;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServicoBuscaSalvaImpl implements IServicoBuscaSalva {

    private final RepositorioBuscaSalva repositorioBuscaSalva;
    private final UsuarioRepository usuarioRepository;
    private final MapperFavoritoBusca mapperFavoritoBusca;

    @Transactional
    @Override
    public RespostaBuscaSalva criarBuscaSalva(UUID usuarioId, CriarBuscaSalvaRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        BuscaSalva buscaSalva = BuscaSalva.builder()
                .usuario(usuario)
                .nome(request.nome())
                .filtros(request.filtros())
                .ativa(true)
                .build();

        BuscaSalva salva = repositorioBuscaSalva.save(buscaSalva);
        return mapperFavoritoBusca.paraResposta(salva);
    }

    @Transactional
    @Override
    public void removerBuscaSalva(UUID id, UUID usuarioId) {
        BuscaSalva buscaSalva = repositorioBuscaSalva.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Busca salva não encontrada."));

        if (!buscaSalva.getUsuario().getId().equals(usuarioId)) {
            throw new ExcecaoNegocio("Você não tem permissão para remover esta busca salva.");
        }

        repositorioBuscaSalva.delete(buscaSalva);
    }

    @Transactional
    @Override
    public RespostaBuscaSalva alternarStatus(UUID id, UUID usuarioId, boolean ativa) {
        BuscaSalva buscaSalva = repositorioBuscaSalva.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Busca salva não encontrada."));

        if (!buscaSalva.getUsuario().getId().equals(usuarioId)) {
            throw new ExcecaoNegocio("Você não tem permissão para alterar esta busca salva.");
        }

        buscaSalva.setAtiva(ativa);
        BuscaSalva salva = repositorioBuscaSalva.save(buscaSalva);
        return mapperFavoritoBusca.paraResposta(salva);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaBuscaSalva> listarBuscasSalvas(UUID usuarioId, Pageable pageable) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ExcecaoRecursoNaoEncontrado("Usuário não encontrado.");
        }
        return repositorioBuscaSalva.findByUsuarioIdOrderByCriadaEmDesc(usuarioId, pageable)
                .map(mapperFavoritoBusca::paraResposta);
    }
}
