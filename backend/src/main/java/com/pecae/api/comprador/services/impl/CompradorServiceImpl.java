package com.pecae.api.comprador.services.impl;

import com.pecae.api.autenticacao.entities.TokenAtualizacao;
import com.pecae.api.autenticacao.repositories.TokenAtualizacaoRepository;
import com.pecae.api.comprador.dtos.AtualizarCompradorRequest;
import com.pecae.api.comprador.dtos.ExcluirContaRequest;
import com.pecae.api.comprador.dtos.RespostaCompradorMe;
import com.pecae.api.comprador.entities.PerfilComprador;
import com.pecae.api.comprador.entities.PreferenciasNotificacao;
import com.pecae.api.comprador.mappers.ICompradorMapper;
import com.pecae.api.comprador.repositories.PerfilCompradorRepository;
import com.pecae.api.comprador.repositories.PreferenciasNotificacaoRepository;
import com.pecae.api.comprador.services.CompradorService;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.StatusUsuario;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Implementação do serviço de gerenciamento do perfil do comprador.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CompradorServiceImpl implements CompradorService {

    private final UsuarioRepository usuarioRepository;
    private final PerfilCompradorRepository perfilCompradorRepository;
    private final PreferenciasNotificacaoRepository preferenciasNotificacaoRepository;
    private final TokenAtualizacaoRepository tokenAtualizacaoRepository;
    private final ICompradorMapper compradorMapper;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    public RespostaCompradorMe obterPerfilPorUsuarioId(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        PerfilComprador perfil = perfilCompradorRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> criarPerfilComprador(usuario));

        PreferenciasNotificacao preferencias = preferenciasNotificacaoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> criarPreferenciasNotificacaoPadrao(usuario));

        return RespostaCompradorMe.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nome(usuario.getNome())
                .emailVerificado(usuario.isEmailVerificado())
                .telefoneVerificado(usuario.isTelefoneVerificado())
                .avatar(usuario.getAvatar())
                .perfilComprador(compradorMapper.toResponse(perfil))
                .preferenciasNotificacao(compradorMapper.toResponse(preferencias))
                .build();
    }

    @Override
    @Transactional
    public RespostaCompradorMe atualizarPerfil(UUID usuarioId, AtualizarCompradorRequest request) {
        log.info("Atualizando perfil de comprador para o usuário: {}", usuarioId);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        // 1. Atualizar campos básicos no Usuario
        if (request.getNome() != null && !request.getNome().isBlank()) {
            usuario.setNome(request.getNome());
        }
        if (request.getAvatar() != null) {
            usuario.setAvatar(request.getAvatar());
        }
        usuarioRepository.save(usuario);

        // 2. Atualizar campos no PerfilComprador
        PerfilComprador perfil = perfilCompradorRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> PerfilComprador.builder().usuario(usuario).build());

        compradorMapper.updateEntity(request, perfil);

        if (request.getNome() != null && !request.getNome().isBlank()) {
            perfil.setNome(request.getNome());
        }
        if (request.getAvatar() != null) {
            perfil.setAvatar(request.getAvatar());
        }
        perfilCompradorRepository.save(perfil);

        // 3. Atualizar PreferenciasNotificacao se enviadas
        PreferenciasNotificacao preferencias = preferenciasNotificacaoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> PreferenciasNotificacao.builder().usuario(usuario).build());

        if (request.getPreferenciasNotificacao() != null) {
            compradorMapper.updateEntity(request.getPreferenciasNotificacao(), preferencias);
            preferenciasNotificacaoRepository.save(preferencias);
        }

        return RespostaCompradorMe.builder()
                .id(usuario.getId())
                .email(usuario.getEmail())
                .nome(usuario.getNome())
                .emailVerificado(usuario.isEmailVerificado())
                .telefoneVerificado(usuario.isTelefoneVerificado())
                .avatar(usuario.getAvatar())
                .perfilComprador(compradorMapper.toResponse(perfil))
                .preferenciasNotificacao(compradorMapper.toResponse(preferencias))
                .build();
    }

    @Override
    @Transactional
    public void excluirConta(UUID usuarioId, ExcluirContaRequest request) {
        log.info("Iniciando exclusão lógica da conta do usuário: {}", usuarioId);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        if (usuario.getStatus() == StatusUsuario.DELETADO) {
            throw new ExcecaoNegocio("A conta já foi excluída.", HttpStatus.UNAUTHORIZED);
        }

        if (usuario.getSenhaHash() != null) {
            if (!passwordEncoder.matches(request.getSenhaAtual(), usuario.getSenhaHash())) {
                throw new ExcecaoNegocio("Senha atual incorreta.", HttpStatus.UNAUTHORIZED);
            }
        }

        LocalDateTime dataDeletado = LocalDateTime.now();

        // 1. Soft delete Usuario
        usuario.setStatus(StatusUsuario.DELETADO);
        usuario.setDeletadoEm(dataDeletado);
        usuario.setEmailOriginal(usuario.getEmail());
        usuarioRepository.save(usuario);

        // 2. Soft delete PerfilComprador
        perfilCompradorRepository.findByUsuarioId(usuarioId).ifPresent(perfil -> {
            perfil.setDeletadoEm(dataDeletado);
            perfilCompradorRepository.save(perfil);
        });

        // 3. Revogar todos os RefreshTokens ativos
        List<TokenAtualizacao> tokensAtivos = tokenAtualizacaoRepository.findByUsuarioIdAndRevogadoEmIsNull(usuarioId);
        tokensAtivos.forEach(token -> token.setRevogadoEm(dataDeletado));
        tokenAtualizacaoRepository.saveAll(tokensAtivos);

        // 4. Executar exclusões lógicas nativas para perfis de vendedores, anúncios e veículos
        executarExclusoesLogicasNativas(usuarioId, dataDeletado);
        log.info("Conta do usuário {} marcada como DELETADO com sucesso.", usuarioId);
    }

    @Transactional
    public PerfilComprador criarPerfilComprador(Usuario usuario) {
        log.info("Criando PerfilComprador padrão sob demanda para o usuário: {}", usuario.getId());
        PerfilComprador perfil = PerfilComprador.builder()
                .usuario(usuario)
                .nome(usuario.getNome())
                .avatar(usuario.getAvatar())
                .build();
        return perfilCompradorRepository.save(perfil);
    }

    @Transactional
    public PreferenciasNotificacao criarPreferenciasNotificacaoPadrao(Usuario usuario) {
        log.info("Criando PreferenciasNotificacao padrão sob demanda para o usuário: {}", usuario.getId());
        PreferenciasNotificacao preferencias = PreferenciasNotificacao.builder()
                .usuario(usuario)
                .pushHabilitado(true)
                .emailHabilitado(true)
                .inAppHabilitado(true)
                .build();
        return preferenciasNotificacaoRepository.save(preferencias);
    }

    private void executarExclusoesLogicasNativas(UUID usuarioId, LocalDateTime deletadoEm) {
        // Soft delete de Perfis de Vendedor
        entityManager.createNativeQuery("UPDATE seller_profiles SET deleted_at = :deletadoEm WHERE user_id = :usuarioId")
                .setParameter("deletadoEm", deletadoEm)
                .setParameter("usuarioId", usuarioId)
                .executeUpdate();

        // Expira e oculta anúncios ativos/pendentes do vendedor
        entityManager.createNativeQuery(
                "UPDATE listings SET status = 'EXPIRED', deleted_at = :deletadoEm " +
                "WHERE seller_profile_id = (SELECT id FROM seller_profiles WHERE user_id = :usuarioId) " +
                "AND deleted_at IS NULL")
                .setParameter("deletadoEm", deletadoEm)
                .setParameter("usuarioId", usuarioId)
                .executeUpdate();

        // Inativa e oculta veículos/sucatas físicas do vendedor
        entityManager.createNativeQuery(
                "UPDATE vehicles SET status = 'INACTIVE', deleted_at = :deletadoEm " +
                "WHERE seller_id = (SELECT id FROM seller_profiles WHERE user_id = :usuarioId) " +
                "AND deleted_at IS NULL")
                .setParameter("deletadoEm", deletadoEm)
                .setParameter("usuarioId", usuarioId)
                .executeUpdate();
    }
}
