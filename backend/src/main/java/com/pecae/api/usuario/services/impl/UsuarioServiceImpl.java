package com.pecae.api.usuario.services.impl;

import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.usuario.dtos.AtualizarUsuarioRequest;
import com.pecae.api.usuario.dtos.UsuarioResponse;
import com.pecae.api.usuario.entities.TokenPush;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.PlataformaPush;
import com.pecae.api.usuario.entities.enums.TipoUsuario;
import com.pecae.api.usuario.mappers.IUsuarioMapper;
import com.pecae.api.usuario.repositories.TokenPushRepository;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.usuario.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

/**
 * Implementação do serviço de gerenciamento de usuários.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final TokenPushRepository tokenPushRepository;
    private final IUsuarioMapper usuarioMapper;

    @Override
    public Usuario buscarEntidadePorId(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário", "id", id));
    }

    @Override
    public Optional<Usuario> buscarEntidadePorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Override
    public UsuarioResponse obterPerfilUsuario(UUID id) {
        Usuario usuario = buscarEntidadePorId(id);
        return usuarioMapper.toResponse(usuario);
    }

    @Override
    @Transactional
    public Usuario criarEntidade(Usuario usuario) {
        log.info("Criando novo usuário com e-mail: {}", usuario.getEmail());
        return usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse atualizarUsuario(UUID id, AtualizarUsuarioRequest request) {
        log.info("Atualizando dados do usuário: {}", id);
        Usuario usuario = buscarEntidadePorId(id);

        if (request.getTelefone() != null && !request.getTelefone().equals(usuario.getTelefone())) {
            if (usuarioRepository.existsByTelefone(request.getTelefone())) {
                throw new IllegalArgumentException("Telefone já está em uso por outro usuário.");
            }
            usuario.setTelefoneVerificado(false);
            usuario.setTelefoneVerificadoEm(null);
        }

        usuarioMapper.updateEntity(request, usuario);
        Usuario usuarioAtualizado = usuarioRepository.save(usuario);
        return usuarioMapper.toResponse(usuarioAtualizado);
    }

    @Override
    @Transactional
    public void atualizarTipoUsuario(UUID id, TipoUsuario novoTipo) {
        log.info("Admin atualizando tipo do usuário {} para {}", id, novoTipo);
        Usuario usuario = buscarEntidadePorId(id);
        usuario.setTipo(novoTipo);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public void salvarTokenPush(UUID usuarioId, String token, PlataformaPush plataforma) {
        log.info("Registrando push token para o usuário: {} na plataforma: {}", usuarioId, plataforma);
        
        if (!usuarioRepository.existsById(usuarioId)) {
            throw new ExcecaoRecursoNaoEncontrado("Usuário", "id", usuarioId);
        }

        TokenPush tokenPush = tokenPushRepository.findByUsuarioIdAndPlataforma(usuarioId, plataforma)
                .map(existente -> {
                    existente.setToken(token);
                    return existente;
                })
                .orElseGet(() -> TokenPush.builder()
                        .usuarioId(usuarioId)
                        .token(token)
                        .plataforma(plataforma)
                        .build());

        tokenPushRepository.save(tokenPush);
    }
}
