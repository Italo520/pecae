package com.pecae.api.moderacao.controllers;

import com.pecae.api.anuncio.repositories.RepositorioAnuncio;
import com.pecae.api.denuncia.repositories.RepositorioDenuncia;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.vendedor.entities.PerfilVendedor;
import com.pecae.api.vendedor.entities.VerificacaoVendedor;
import com.pecae.api.vendedor.entities.enums.StatusVerificacao;
import com.pecae.api.vendedor.repositories.VerificacaoVendedorRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ControladorAdminCompatibilidadeTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RepositorioAnuncio repositorioAnuncio;

    @Mock
    private VerificacaoVendedorRepository verificacaoVendedorRepository;

    @Mock
    private RepositorioDenuncia repositorioDenuncia;

    @Mock
    private com.pecae.api.ad.repositories.RepositorioCampanhaAd repositorioCampanhaAd;

    @Mock
    private com.pecae.api.ad.repositories.RepositorioCliqueAd repositorioCliqueAd;

    @Mock
    private com.pecae.api.ad.services.IServicoAd servicoAd;

    @InjectMocks
    private ControladorAdminCompatibilidade controlador;

    @Test
    @DisplayName("GET /admin/stats - Deve retornar estatísticas sem exceção")
    void deveRetornarStats() {
        when(usuarioRepository.count()).thenReturn(10L);
        when(repositorioAnuncio.countByStatus(com.pecae.api.anuncio.entities.enums.StatusAnuncio.PUBLICADO)).thenReturn(5L);
        when(verificacaoVendedorRepository.findAll()).thenReturn(List.of());
        when(repositorioDenuncia.findAll()).thenReturn(List.of());

        ResponseEntity<Map<String, Object>> response = controlador.getStats();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("activeUsers")).isEqualTo(10L);
        assertThat(response.getBody().get("activeListings")).isEqualTo(5L);
    }

    @Test
    @DisplayName("GET /admin/kyc/pending - Deve retornar lista de documentos pendentes ordenada")
    void deveRetornarPendingKyc() {
        PerfilVendedor perfil = PerfilVendedor.builder()
                .id(UUID.randomUUID())
                .nome("Loja Teste")
                .documento("12345678000199")
                .build();

        VerificacaoVendedor v1 = VerificacaoVendedor.builder()
                .id(UUID.randomUUID())
                .perfilVendedor(perfil)
                .status(StatusVerificacao.PENDENTE)
                .solicitadoEm(LocalDateTime.now())
                .documentosUrls(List.of("doc1.pdf"))
                .build();

        when(verificacaoVendedorRepository.findAll()).thenReturn(List.of(v1));

        ResponseEntity<List<Map<String, Object>>> response = controlador.getPendingKyc(5);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).get("id")).isEqualTo(v1.getId());
    }

    @Test
    @DisplayName("POST /admin/kyc/{id}/approve - Deve aprovar KYC e atualizar usuário para AMBOS")
    void deveAprovarKycComSucesso() {
        UUID id = UUID.randomUUID();
        com.pecae.api.usuario.entities.Usuario usuario = com.pecae.api.usuario.entities.Usuario.builder()
                .id(UUID.randomUUID())
                .nome("Vendedor Teste")
                .tipo(com.pecae.api.usuario.entities.enums.TipoUsuario.COMPRADOR)
                .build();

        PerfilVendedor perfil = PerfilVendedor.builder()
                .id(UUID.randomUUID())
                .usuario(usuario)
                .build();

        VerificacaoVendedor verification = VerificacaoVendedor.builder()
                .id(id)
                .perfilVendedor(perfil)
                .status(StatusVerificacao.PENDENTE)
                .build();

        when(verificacaoVendedorRepository.findById(id)).thenReturn(java.util.Optional.of(verification));

        ResponseEntity<Map<String, Object>> response = controlador.approveKyc(id);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).containsEntry("status", "APPROVED");
        assertThat(verification.getStatus()).isEqualTo(StatusVerificacao.APROVADO);
        assertThat(usuario.getTipo()).isEqualTo(com.pecae.api.usuario.entities.enums.TipoUsuario.AMBOS);
    }
}
