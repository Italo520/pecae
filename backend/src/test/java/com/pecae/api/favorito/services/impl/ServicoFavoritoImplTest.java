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
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoFavoritoImpl")
class ServicoFavoritoImplTest {

    @Mock
    private RepositorioFavorito repositorioFavorito;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RepositorioAnuncio repositorioAnuncio;

    @Mock
    private MapperFavoritoBusca mapperFavoritoBusca;

    @InjectMocks
    private ServicoFavoritoImpl servicoFavorito;

    @Test
    @DisplayName("Deve adicionar favorito com sucesso e incrementar totalFavoritos")
    void deveAdicionarFavoritoComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();

        Usuario usuario = Usuario.builder().id(usuarioId).nome("Comprador").build();
        Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .titulo("Peça Legal")
                .status(StatusAnuncio.PUBLICADO)
                .totalFavoritos(5)
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));
        when(repositorioFavorito.existsByUsuarioIdAndAnuncioId(usuarioId, anuncioId)).thenReturn(false);

        servicoFavorito.adicionarFavorito(usuarioId, anuncioId);

        verify(repositorioFavorito, times(1)).save(any(Favorito.class));
        verify(repositorioAnuncio, times(1)).save(anuncio);
        assertThat(anuncio.getTotalFavoritos()).isEqualTo(6);
    }

    @Test
    @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando usuário não existir")
    void deveLancarExcecaoAoAdicionarSeUsuarioNaoExistir() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicoFavorito.adicionarFavorito(usuarioId, anuncioId))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                .hasMessageContaining("Usuário não encontrado.");
    }

    @Test
    @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando anúncio não existir")
    void deveLancarExcecaoAoAdicionarSeAnuncioNaoExistir() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicoFavorito.adicionarFavorito(usuarioId, anuncioId))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                .hasMessageContaining("Anúncio não encontrado.");
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio quando anúncio não estiver publicado")
    void deveLancarExcecaoAoAdicionarSeAnuncioNaoPublicado() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .status(StatusAnuncio.PENDENTE)
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));

        assertThatThrownBy(() -> servicoFavorito.adicionarFavorito(usuarioId, anuncioId))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Apenas anúncios publicados podem ser favoritados.");
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio quando anúncio já for favoritado")
    void deveLancarExcecaoAoAdicionarSeJaFavoritado() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .status(StatusAnuncio.PUBLICADO)
                .build();

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));
        when(repositorioFavorito.existsByUsuarioIdAndAnuncioId(usuarioId, anuncioId)).thenReturn(true);

        assertThatThrownBy(() -> servicoFavorito.adicionarFavorito(usuarioId, anuncioId))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Este anúncio já foi favoritado.");
    }

    @Test
    @DisplayName("Deve remover favorito com sucesso e decrementar totalFavoritos")
    void deveRemoverFavoritoComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();

        Anuncio anuncio = Anuncio.builder()
                .id(anuncioId)
                .totalFavoritos(1)
                .build();

        when(repositorioFavorito.existsByUsuarioIdAndAnuncioId(usuarioId, anuncioId)).thenReturn(true);
        when(repositorioAnuncio.findById(anuncioId)).thenReturn(Optional.of(anuncio));

        servicoFavorito.removerFavorito(usuarioId, anuncioId);

        verify(repositorioFavorito, times(1)).deleteByUsuarioIdAndAnuncioId(usuarioId, anuncioId);
        verify(repositorioAnuncio, times(1)).save(anuncio);
        assertThat(anuncio.getTotalFavoritos()).isEqualTo(0);
    }

    @Test
    @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado ao tentar remover favorito inexistente")
    void deveLancarExcecaoAoRemoverSeNaoExistir() {
        UUID usuarioId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();

        when(repositorioFavorito.existsByUsuarioIdAndAnuncioId(usuarioId, anuncioId)).thenReturn(false);

        assertThatThrownBy(() -> servicoFavorito.removerFavorito(usuarioId, anuncioId))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                .hasMessageContaining("Favorito não encontrado.");
    }

    @Test
    @DisplayName("Deve listar favoritos de um usuário com sucesso")
    void deveListarFavoritosComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        Favorito favorito = Favorito.builder()
                .id(UUID.randomUUID())
                .criadoEm(LocalDateTime.now())
                .build();

        Page<Favorito> paginaFavoritos = new PageImpl<>(List.of(favorito), pageable, 1);
        RespostaFavorito resposta = new RespostaFavorito(favorito.getId(), null, favorito.getCriadoEm());

        when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
        when(repositorioFavorito.buscarPorUsuarioId(usuarioId, pageable)).thenReturn(paginaFavoritos);
        when(mapperFavoritoBusca.paraResposta(favorito)).thenReturn(resposta);

        Page<RespostaFavorito> resultado = servicoFavorito.listarFavoritos(usuarioId, pageable);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
        verify(repositorioFavorito, times(1)).buscarPorUsuarioId(usuarioId, pageable);
    }
}
