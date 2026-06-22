package com.pecae.api.denuncia.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.denuncia.dtos.request.CriarDenunciaRequest;
import com.pecae.api.denuncia.dtos.response.RespostaDenuncia;
import com.pecae.api.denuncia.entities.Denuncia;
import com.pecae.api.denuncia.entities.enums.CategoriaDenuncia;
import com.pecae.api.denuncia.entities.enums.StatusDenuncia;
import com.pecae.api.denuncia.entities.enums.TipoAlvoDenuncia;
import com.pecae.api.denuncia.mappers.MapperDenuncia;
import com.pecae.api.denuncia.repositories.RepositorioDenuncia;
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
@DisplayName("Testes do ServicoDenunciaImpl")
class ServicoDenunciaImplTest {

    @Mock
    private RepositorioDenuncia repositorioDenuncia;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private MapperDenuncia mapperDenuncia;

    @InjectMocks
    private ServicoDenunciaImpl servicoDenuncia;

    @Test
    @DisplayName("Deve submeter denúncia com sucesso")
    void deveSubmeterDenunciaComSucesso() {
        UUID reporterId = UUID.randomUUID();
        UUID alvoId = UUID.randomUUID();
        Usuario reporter = Usuario.builder().id(reporterId).nome("Reporter").build();

        CriarDenunciaRequest request = new CriarDenunciaRequest(
            TipoAlvoDenuncia.ANUNCIO,
            alvoId,
            CategoriaDenuncia.FRAUDE,
            "Anúncio falso"
        );

        Denuncia denunciaSalva = Denuncia.builder()
            .id(UUID.randomUUID())
            .denunciante(reporter)
            .tipoAlvo(TipoAlvoDenuncia.ANUNCIO)
            .idAlvo(alvoId)
            .categoria(CategoriaDenuncia.FRAUDE)
            .descricao("Anúncio falso")
            .status(StatusDenuncia.PENDENTE)
            .criadaEm(LocalDateTime.now())
            .atualizadaEm(LocalDateTime.now())
            .build();

        RespostaDenuncia respostaEsperada = new RespostaDenuncia(
            denunciaSalva.getId(),
            reporterId,
            "Reporter",
            TipoAlvoDenuncia.ANUNCIO,
            alvoId,
            CategoriaDenuncia.FRAUDE,
            "Anúncio falso",
            StatusDenuncia.PENDENTE,
            denunciaSalva.getCriadaEm(),
            denunciaSalva.getAtualizadaEm()
        );

        when(usuarioRepository.findById(reporterId)).thenReturn(Optional.of(reporter));
        when(repositorioDenuncia.save(any(Denuncia.class))).thenReturn(denunciaSalva);
        when(mapperDenuncia.paraResposta(any(Denuncia.class))).thenReturn(respostaEsperada);

        RespostaDenuncia resultado = servicoDenuncia.submeterDenuncia(reporterId, request);

        assertThat(resultado).isNotNull();
        assertThat(resultado.categoria()).isEqualTo(CategoriaDenuncia.FRAUDE);
        assertThat(resultado.status()).isEqualTo(StatusDenuncia.PENDENTE);
        verify(repositorioDenuncia, times(1)).save(any(Denuncia.class));
    }

    @Test
    @DisplayName("Deve lançar ExcecaoRecursoNaoEncontrado quando denunciante não existir")
    void deveLancarExcecaoQuandoDenuncianteNaoExistir() {
        UUID reporterId = UUID.randomUUID();
        CriarDenunciaRequest request = new CriarDenunciaRequest(
            TipoAlvoDenuncia.ANUNCIO,
            UUID.randomUUID(),
            CategoriaDenuncia.FRAUDE,
            "Descrição"
        );

        when(usuarioRepository.findById(reporterId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicoDenuncia.submeterDenuncia(reporterId, request))
            .isInstanceOf(ExcecaoRecursoNaoEncontrado.class)
            .hasMessageContaining("denunciante não encontrado");
    }

    @Test
    @DisplayName("Deve listar denúncias do próprio usuário com sucesso")
    void deveListarDenunciasDoUsuarioComSucesso() {
        UUID reporterId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);

        Denuncia denuncia = Denuncia.builder()
            .id(UUID.randomUUID())
            .tipoAlvo(TipoAlvoDenuncia.ANUNCIO)
            .build();

        Page<Denuncia> paginaEntidades = new PageImpl<>(List.of(denuncia), pageable, 1);

        RespostaDenuncia resposta = new RespostaDenuncia(
            denuncia.getId(),
            reporterId,
            "Reporter",
            TipoAlvoDenuncia.ANUNCIO,
            UUID.randomUUID(),
            CategoriaDenuncia.FRAUDE,
            "Desc",
            StatusDenuncia.PENDENTE,
            LocalDateTime.now(),
            LocalDateTime.now()
        );

        when(repositorioDenuncia.buscarPorDenuncianteId(reporterId, pageable)).thenReturn(paginaEntidades);
        when(mapperDenuncia.paraResposta(denuncia)).thenReturn(resposta);

        Page<RespostaDenuncia> resultado = servicoDenuncia.listarMinhasDenuncias(reporterId, pageable);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getContent()).hasSize(1);
        verify(repositorioDenuncia, times(1)).buscarPorDenuncianteId(reporterId, pageable);
    }
}
