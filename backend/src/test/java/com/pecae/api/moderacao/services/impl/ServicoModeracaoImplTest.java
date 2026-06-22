package com.pecae.api.moderacao.services.impl;

import com.pecae.api.anuncio.entities.enums.StatusAnuncio;
import com.pecae.api.anuncio.services.IServicoAnuncio;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.Denuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.mappers.MapperDenuncia;
import com.pecae.api.denuncia.repositories.RepositorioDenuncia;
import com.pecae.api.moderacao.dtos.request.DecisaoModeracaoRequest;
import com.pecae.api.moderacao.dtos.response.RespostaLogAuditoria;
import com.pecae.api.moderacao.entities.LogAuditoria;
import com.pecae.api.moderacao.entities.enums.AcaoModeracao;
import com.pecae.api.moderacao.mappers.MapperModeracao;
import com.pecae.api.moderacao.repositories.RepositorioLogAuditoria;
import com.pecae.api.moderacao.services.IServicoAuditoria;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Testes do ServicoModeracaoImpl")
class ServicoModeracaoImplTest {

    @Mock
    private RepositorioDenuncia repositorioDenuncia;

    @Mock
    private RepositorioLogAuditoria repositorioLogAuditoria;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private IServicoAnuncio servicoAnuncio;

    @Mock
    private IServicoAuditoria servicoAuditoria;

    @Mock
    private MapperDenuncia mapperDenuncia;

    @Mock
    private MapperModeracao mapperModeracao;

    @InjectMocks
    private ServicoModeracaoImpl servicoModeracao;

    @Test
    @DisplayName("Deve listar denúncias pendentes com sucesso")
    void deveListarDenunciasPendentesComSucesso() {
        Pageable pageable = PageRequest.of(0, 10);
        Denuncia denuncia = Denuncia.builder().id(UUID.randomUUID()).status(StatusDenuncia.PENDENTE).build();
        Page<Denuncia> paginaEntidades = new PageImpl<>(List.of(denuncia), pageable, 1);

        RespostaDenuncia resposta = new RespostaDenuncia(
            denuncia.getId(), UUID.randomUUID(), "Reporter", null, UUID.randomUUID(), null, "desc", StatusDenuncia.PENDENTE, null, null
        );

        when(repositorioDenuncia.findAllByStatus(StatusDenuncia.PENDENTE, pageable)).thenReturn(paginaEntidades);
        when(mapperDenuncia.paraResposta(denuncia)).thenReturn(resposta);

        Page<RespostaDenuncia> resultado = servicoModeracao.listarDenunciasPendentes(pageable);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
        verify(repositorioDenuncia, times(1)).findAllByStatus(StatusDenuncia.PENDENTE, pageable);
    }

    @Test
    @DisplayName("Deve processar denúncia resolvendo-a e registrando auditoria")
    void deveProcessarDenunciaResolvendo() {
        UUID moderadorId = UUID.randomUUID();
        UUID denunciaId = UUID.randomUUID();
        Usuario moderador = Usuario.builder().id(moderadorId).build();
        Denuncia denuncia = Denuncia.builder().id(denunciaId).status(StatusDenuncia.PENDENTE).build();

        DecisaoModeracaoRequest request = new DecisaoModeracaoRequest(AcaoModeracao.RESOLVER_DENUNCIA, "Conteúdo inadequado removido");

        when(usuarioRepository.findById(moderadorId)).thenReturn(Optional.of(moderador));
        when(repositorioDenuncia.findById(denunciaId)).thenReturn(Optional.of(denuncia));

        servicoModeracao.processarDenuncia(moderadorId, denunciaId, request);

        assertThat(denuncia.getStatus()).isEqualTo(StatusDenuncia.RESOLVIDA);
        verify(repositorioDenuncia, times(1)).save(denuncia);
        verify(servicoAuditoria, times(1)).registrarAcao(moderador, AcaoModeracao.RESOLVER_DENUNCIA, "DENUNCIA", denunciaId, "Conteúdo inadequado removido");
    }

    @Test
    @DisplayName("Deve lançar ExcecaoNegocio ao processar denúncia já processada")
    void deveLancarExcecaoParaDenunciaJaProcessada() {
        UUID moderadorId = UUID.randomUUID();
        UUID denunciaId = UUID.randomUUID();
        Usuario moderador = Usuario.builder().id(moderadorId).build();
        Denuncia denuncia = Denuncia.builder().id(denunciaId).status(StatusDenuncia.RESOLVIDA).build();

        DecisaoModeracaoRequest request = new DecisaoModeracaoRequest(AcaoModeracao.RESOLVER_DENUNCIA, "Motivo");

        when(usuarioRepository.findById(moderadorId)).thenReturn(Optional.of(moderador));
        when(repositorioDenuncia.findById(denunciaId)).thenReturn(Optional.of(denuncia));

        assertThatThrownBy(() -> servicoModeracao.processarDenuncia(moderadorId, denunciaId, request))
            .isInstanceOf(ExcecaoNegocio.class)
            .hasMessageContaining("Esta denúncia já foi processada");
    }

    @Test
    @DisplayName("Deve moderar anúncio aprovando-o e registrando auditoria")
    void deveModerarAnuncioAprovando() {
        UUID moderadorId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();
        Usuario moderador = Usuario.builder().id(moderadorId).build();

        DecisaoModeracaoRequest request = new DecisaoModeracaoRequest(AcaoModeracao.APROVAR_ANUNCIO, "Anúncio verificado");

        when(usuarioRepository.findById(moderadorId)).thenReturn(Optional.of(moderador));

        servicoModeracao.moderarAnuncio(moderadorId, anuncioId, request);

        verify(servicoAnuncio, times(1)).moderar(anuncioId, StatusAnuncio.PUBLICADO);
        verify(servicoAuditoria, times(1)).registrarAcao(moderador, AcaoModeracao.APROVAR_ANUNCIO, "ANUNCIO", anuncioId, "Anúncio verificado");
    }

    @Test
    @DisplayName("Deve moderar anúncio rejeitando-o e registrando auditoria")
    void deveModerarAnuncioRejeitando() {
        UUID moderadorId = UUID.randomUUID();
        UUID anuncioId = UUID.randomUUID();
        Usuario moderador = Usuario.builder().id(moderadorId).build();

        DecisaoModeracaoRequest request = new DecisaoModeracaoRequest(AcaoModeracao.REJEITAR_ANUNCIO, "Preço incompatível");

        when(usuarioRepository.findById(moderadorId)).thenReturn(Optional.of(moderador));

        servicoModeracao.moderarAnuncio(moderadorId, anuncioId, request);

        verify(servicoAnuncio, times(1)).moderar(anuncioId, StatusAnuncio.REJEITADO);
        verify(servicoAuditoria, times(1)).registrarAcao(moderador, AcaoModeracao.REJEITAR_ANUNCIO, "ANUNCIO", anuncioId, "Preço incompatível");
    }

    @Test
    @DisplayName("Deve listar logs de auditoria com sucesso")
    void deveListarLogsAuditoriaComSucesso() {
        Pageable pageable = PageRequest.of(0, 10);
        LogAuditoria logAuditoria = LogAuditoria.builder().id(UUID.randomUUID()).build();
        Page<LogAuditoria> paginaEntidades = new PageImpl<>(List.of(logAuditoria), pageable, 1);

        RespostaLogAuditoria resposta = new RespostaLogAuditoria(
            logAuditoria.getId(), UUID.randomUUID(), "Moderador", AcaoModeracao.APROVAR_ANUNCIO, "ANUNCIO", UUID.randomUUID(), "motivo", LocalDateTime.now()
        );

        when(repositorioLogAuditoria.buscarTodosComModerador(pageable)).thenReturn(paginaEntidades);
        when(mapperModeracao.paraRespostaLogAuditoria(logAuditoria)).thenReturn(resposta);

        Page<RespostaLogAuditoria> resultado = servicoModeracao.listarLogsAuditoria(pageable);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
        verify(repositorioLogAuditoria, times(1)).buscarTodosComModerador(pageable);
    }
}
