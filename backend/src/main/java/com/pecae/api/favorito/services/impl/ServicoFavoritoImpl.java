package com.pecae.api.favorito.services.impl;

import com.pecae.api.anuncio.entities.Anuncio;
import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.favorito.dtos.response.RespostaFavorito;
import com.pecae.api.favorito.entities.Favorito;
import com.pecae.api.favorito.mappers.MapperFavoritoBusca;
import com.pecae.api.favorito.repositories.RepositorioFavorito;
import com.pecae.api.favorito.services.IServicoFavorito;
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
public class ServicoFavoritoImpl implements IServicoFavorito {

    private final RepositorioFavorito repositorioFavorito;
    private final UsuarioRepository usuarioRepository;
    private final RepositorioAnuncio repositorioAnuncio;
    private final MapperFavoritoBusca mapperFavoritoBusca;

    @Transactional
    @Override
    public void adicionarFavorito(UUID usuarioId, UUID anuncioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        Anuncio anuncio = repositorioAnuncio.findById(anuncioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Anúncio não encontrado."));

        if (anuncio.getStatus() != StatusAnuncio.PUBLICADO) {
            throw new ExcecaoNegocio("Apenas anúncios publicados podem ser favoritados.");
        }

        if (repositorioFavorito.existsByUsuarioIdAndAnuncioId(usuarioId, anuncioId)) {
            throw new ExcecaoNegocio("Este anúncio já foi favoritado.");
        }

        Favorito favorito = Favorito.builder()
                .usuario(usuario)
                .anuncio(anuncio)
                .build();

        repositorioFavorito.save(favorito);

        anuncio.setTotalFavoritos(anuncio.getTotalFavoritos() + 1);
        repositorioAnuncio.save(anuncio);
    }

    @Transactional
    @Override
    public void removerFavorito(UUID usuarioId, UUID anuncioId) {
        if (!repositorioFavorito.existsByUsuarioIdAndAnuncioId(usuarioId, anuncioId)) {
            throw new ExcecaoRecursoNaoEncontrado("Favorito não encontrado.");
        }

        repositorioFavorito.deleteByUsuarioIdAndAnuncioId(usuarioId, anuncioId);

        repositorioAnuncio.findById(anuncioId).ifPresent(anuncio -> {
            if (anuncio.getTotalFavoritos() > 0) {
                anuncio.setTotalFavoritos(anuncio.getTotalFavoritos() - 1);
                repositorioAnuncio.save(anuncio);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RespostaFavorito> listarFavoritos(UUID usuarioId, Pageable pageable) {
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ExcecaoRecursoNaoEncontrado("Usuário não encontrado.");
        }
        return repositorioFavorito.buscarPorUsuarioId(usuarioId, pageable)
                .map(mapperFavoritoBusca::paraResposta);
    }
}
