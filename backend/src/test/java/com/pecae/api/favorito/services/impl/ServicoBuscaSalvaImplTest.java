package com.pecae.api.favorito.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.favorito.dtos.request.CriarBuscaSalvaRequest;
import com.pecae.api.favorito.dtos.response.RespostaBuscaSalva;
import com.pecae.api.favorito.entities.BuscaSalva;
import com.pecae.api.favorito.mappers.MapperFavoritoBusca;
import com.pecae.api.favorito.repositories.RepositorioBuscaSalva;
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
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoBuscaSalvaImpl")
class ServicoBuscaSalvaImplTest {

    @Mock
    private RepositorioBuscaSalva repositorioBuscaSalva;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MapperFavoritoBusca mapperFavoritoBusca;

    @InjectMocks
    private ServicoBuscaSalvaImpl servicoBuscaSalva;

    @Test
    @DisplayName("Deve criar busca salva com sucesso")
    void deveCriarBuscaSalvaComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).nome("João").build();
        CriarBuscaSalvaRequest request = new CriarBuscaSalvaRequest("Filtro Motor", Map.of("peca", "motor"));

        BuscaSalva buscaSalva = BuscaSalva.builder()
                .id(UUID.randomUUID())
                .usuario(usuario)
                .nome("Filtro Motor")
                .filtros(Map.of("peca", "motor"))
                .ativa(true)
                .criadaEm(LocalDateTime.now())
                .build();

        RespostaBuscaSalva resposta = new RespostaBuscaSalva(
                buscaSalva.getId(),
                "Filtro Motor",
                Map.of("peca", "motor"),
                true,
                buscaSalva.getCriadaEm()
        );

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));
        when(repositorioBuscaSalva.save(any(BuscaSalva.class))).thenReturn(buscaSalva);
        when(mapperFavoritoBusca.paraResposta(buscaSalva)).thenReturn(resposta);

        RespostaBuscaSalva resultado = servicoBuscaSalva.criarBuscaSalva(usuarioId, request);

        assertThat(resultado).isNotNull();
        assertThat(resultado.nome()).isEqualTo("Filtro Motor");
        verify(repositorioBuscaSalva, times(1)).save(any(BuscaSalva.class));
    }

    @Test
    @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando criar busca para usuário inexistente")
    void deveLancarExcecaoAoCriarSeUsuarioNaoExistir() {
        UUID usuarioId = UUID.randomUUID();
        CriarBuscaSalvaRequest request = new CriarBuscaSalvaRequest("Filtro Motor", Map.of("peca", "motor"));

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicoBuscaSalva.criarBuscaSalva(usuarioId, request))
                .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
                .hasMessageContaining("Usuário não encontrado.");
    }

    @Test
    @DisplayName("Deve remover busca salva com sucesso")
    void deveRemoverBuscaSalvaComSucesso() {
        UUID buscaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        BuscaSalva buscaSalva = BuscaSalva.builder()
                .id(buscaId)
                .usuario(usuario)
                .build();

        when(repositorioBuscaSalva.findById(buscaId)).thenReturn(Optional.of(buscaSalva));

        servicoBuscaSalva.removerBuscaSalva(buscaId, usuarioId);

        verify(repositorioBuscaSalva, times(1)).delete(buscaSalva);
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio quando tentar remover busca salva de outro usuário")
    void deveLancarExcecaoAoRemoverDeOutroUsuario() {
        UUID buscaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(outroUsuarioId).build();
        BuscaSalva buscaSalva = BuscaSalva.builder()
                .id(buscaId)
                .usuario(usuario)
                .build();

        when(repositorioBuscaSalva.findById(buscaId)).thenReturn(Optional.of(buscaSalva));

        assertThatThrownBy(() -> servicoBuscaSalva.removerBuscaSalva(buscaId, usuarioId))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Você não tem permissão para remover esta busca salva.");
    }

    @Test
    @DisplayName("Deve alternar status ativa com sucesso")
    void deveAlternarStatusComSucesso() {
        UUID buscaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(usuarioId).build();
        BuscaSalva buscaSalva = BuscaSalva.builder()
                .id(buscaId)
                .usuario(usuario)
                .ativa(true)
                .build();

        when(repositorioBuscaSalva.findById(buscaId)).thenReturn(Optional.of(buscaSalva));
        when(repositorioBuscaSalva.save(buscaSalva)).thenReturn(buscaSalva);

        servicoBuscaSalva.alternarStatus(buscaId, usuarioId, false);

        assertThat(buscaSalva.getAtiva()).isFalse();
        verify(repositorioBuscaSalva, times(1)).save(buscaSalva);
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio ao tentar alternar status de busca salva de outro usuário")
    void deveLancarExcecaoAoAlternarStatusDeOutroUsuario() {
        UUID buscaId = UUID.randomUUID();
        UUID usuarioId = UUID.randomUUID();
        UUID outroUsuarioId = UUID.randomUUID();
        Usuario usuario = Usuario.builder().id(outroUsuarioId).build();
        BuscaSalva buscaSalva = BuscaSalva.builder()
                .id(buscaId)
                .usuario(usuario)
                .ativa(true)
                .build();

        when(repositorioBuscaSalva.findById(buscaId)).thenReturn(Optional.of(buscaSalva));

        assertThatThrownBy(() -> servicoBuscaSalva.alternarStatus(buscaId, usuarioId, false))
                .isInstanceOf(ExcecaoNegocio.class)
                .hasMessageContaining("Você não tem permissão para alterar esta busca salva.");
    }

    @Test
    @DisplayName("Deve listar buscas salvas do usuário com sucesso")
    void deveListarBuscasSalvasComSucesso() {
        UUID usuarioId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);
        BuscaSalva buscaSalva = BuscaSalva.builder()
                .id(UUID.randomUUID())
                .nome("Filtro")
                .criadaEm(LocalDateTime.now())
                .build();

        Page<BuscaSalva> paginaBuscas = new PageImpl<>(List.of(buscaSalva), pageable, 1);
        RespostaBuscaSalva resposta = new RespostaBuscaSalva(buscaSalva.getId(), "Filtro", null, true, buscaSalva.getCriadaEm());

        when(usuarioRepository.existsById(usuarioId)).thenReturn(true);
        when(repositorioBuscaSalva.findByUsuarioIdOrderByCriadaEmDesc(usuarioId, pageable)).thenReturn(paginaBuscas);
        when(mapperFavoritoBusca.paraResposta(buscaSalva)).thenReturn(resposta);

        Page<RespostaBuscaSalva> resultado = servicoBuscaSalva.listarBuscasSalvas(usuarioId, pageable);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
        verify(repositorioBuscaSalva, times(1)).findByUsuarioIdOrderByCriadaEmDesc(usuarioId, pageable);
    }
}
