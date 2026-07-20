package com.pecae.api.autenticacao.services.impl;

import com.pecae.api.autenticacao.dtos.*;
import com.pecae.api.autenticacao.entities.AceiteTermos;
import com.pecae.api.autenticacao.entities.TokenAtualizacao;
import com.pecae.api.autenticacao.entities.TokenRedefinicaoSenha;
import com.pecae.api.autenticacao.entities.TokenVerificacaoEmail;
import com.pecae.api.autenticacao.mappers.IAutenticacaoMapper;
import com.pecae.api.autenticacao.repositories.AceiteTermosRepository;
import com.pecae.api.autenticacao.repositories.TokenAtualizacaoRepository;
import com.pecae.api.autenticacao.repositories.TokenRedefinicaoSenhaRepository;
import com.pecae.api.autenticacao.repositories.TokenVerificacaoEmailRepository;
import com.pecae.api.autenticacao.services.AutenticacaoService;
import com.pecae.api.compartilhado.excecao.ExcecaoNegocio;
import com.pecae.api.compartilhado.excecao.ExcecaoRecursoNaoEncontrado;
import com.pecae.api.compartilhado.seguranca.PrincipalUsuario;
import com.pecae.api.compartilhado.seguranca.ProvedorTokenJwt;
import com.pecae.api.usuario.entities.Usuario;
import com.pecae.api.usuario.entities.enums.StatusUsuario;
import com.pecae.api.usuario.mappers.IUsuarioMapper;
import com.pecae.api.usuario.repositories.UsuarioRepository;
import com.pecae.api.usuario.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pecae.api.mail.services.IServicoEmail;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

/**
 * Serviço responsável pelo fluxo completo de autenticação e identidade dos usuários.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AutenticacaoServiceImpl implements AutenticacaoService {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final TokenAtualizacaoRepository tokenAtualizacaoRepository;
    private final TokenVerificacaoEmailRepository tokenVerificacaoEmailRepository;
    private final TokenRedefinicaoSenhaRepository tokenRedefinicaoSenhaRepository;
    private final AceiteTermosRepository aceiteTermosRepository;

    private final PasswordEncoder passwordEncoder;
    private final ProvedorTokenJwt provedorTokenJwt;
    private final AuthenticationManager authenticationManager;
    private final IAutenticacaoMapper autenticacaoMapper;
    private final IUsuarioMapper usuarioMapper;
    private final IServicoEmail servicoEmail;

    @Value("${jwt.refresh-expiration}")
    private long expiraRefreshMs;

    @Override
    @Transactional
    public RespostaAutenticacao registrar(RegistroRequest request, String ip, String userAgent) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ExcecaoNegocio("E-mail já está em uso.", HttpStatus.CONFLICT);
        }

        // Converte DTO para entidade Usuario e codifica a senha
        Usuario usuario = autenticacaoMapper.toUsuario(request);
        usuario.setSenhaHash(passwordEncoder.encode(request.getSenha()));
        
        // Define aceites da LGPD
        usuario.setTermosAceitosEm(LocalDateTime.now());
        usuario.setPrivacidadeAceitaEm(LocalDateTime.now());
        
        Usuario usuarioSalvo = usuarioService.criarEntidade(usuario);

        // Cria registro de aceite dos termos
        AceiteTermos termos = AceiteTermos.builder()
                .usuarioId(usuarioSalvo.getId())
                .version("1.0")
                .ip(ip)
                .userAgent(userAgent)
                .build();
        aceiteTermosRepository.save(termos);

        // Gera token de verificação de e-mail (código de 6 dígitos)
        String codigoVerificacao = gerarCodigo6Digitos();
        String hashToken = gerarHashString(codigoVerificacao);

        TokenVerificacaoEmail tokenEmail = TokenVerificacaoEmail.builder()
                .usuarioId(usuarioSalvo.getId())
                .tokenHash(hashToken)
                .expiraEm(LocalDateTime.now().plusDays(1)) // Expira em 24h
                .build();
        tokenVerificacaoEmailRepository.save(tokenEmail);

        // Enviar e-mail real via Resend (com fallback automático de log no console/log se não configurado)
        servicoEmail.enviar(
            usuarioSalvo.getEmail(),
            "Verificação de E-mail — PECAÊ",
            String.format("Olá %s,\n\nUse o código abaixo para ativar sua conta PECAÊ:\n\nCÓDIGO: %s\n\nEste código expira em 24 horas.", usuarioSalvo.getNome(), codigoVerificacao)
        );

        // Mock do envio de e-mail no console para auditoria local
        log.info("------------------------------------------------------------------");
        log.info("[MOCK EMAIL SENDER] Verificação de e-mail para: {}", usuarioSalvo.getEmail());
        log.info("Olá {}, use o código abaixo para ativar sua conta PECAÊ:", usuarioSalvo.getNome());
        log.info("CÓDIGO: {}", codigoVerificacao);
        log.info("------------------------------------------------------------------");

        // Gera tokens iniciais para o usuário deslogado / logado parcialmente
        PrincipalUsuario principal = PrincipalUsuario.criar(usuarioSalvo);
        String tokenAcesso = provedorTokenJwt.gerarToken(principal);
        String tokenAtualizacao = criarESalvarTokenAtualizacao(usuarioSalvo.getId(), ip, userAgent);

        return RespostaAutenticacao.builder()
                .tokens(RespostaAutenticacao.TokensResponse.builder()
                        .accessToken(tokenAcesso)
                        .refreshToken(tokenAtualizacao)
                        .build())
                .usuario(usuarioMapper.toResponse(usuarioSalvo))
                .build();
    }

    @Override
    @Transactional
    public RespostaAutenticacao login(LoginRequest request, String ip, String userAgent) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ExcecaoNegocio("Credenciais inválidas ou e-mail não verificado.", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenhaHash())) {
            throw new ExcecaoNegocio("Credenciais inválidas ou e-mail não verificado.", HttpStatus.UNAUTHORIZED);
        }

        if (!usuario.isEmailVerificado()) {
            throw new ExcecaoNegocio("E-mail não verificado. Por favor, verifique sua caixa de entrada.", HttpStatus.UNAUTHORIZED);
        }

        if (usuario.getStatus() != StatusUsuario.ATIVO) {
            throw new ExcecaoNegocio("Conta de usuário inativa ou bloqueada.", HttpStatus.FORBIDDEN);
        }

        // Autentica no contexto do Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        PrincipalUsuario principal = (PrincipalUsuario) authentication.getPrincipal();

        // Atualiza último acesso
        usuario.setUltimoAcessoEm(LocalDateTime.now());
        usuarioRepository.save(usuario);

        // Emite tokens
        String tokenAcesso = provedorTokenJwt.gerarToken(principal);
        String tokenAtualizacao = criarESalvarTokenAtualizacao(usuario.getId(), ip, userAgent);

        return RespostaAutenticacao.builder()
                .tokens(RespostaAutenticacao.TokensResponse.builder()
                        .accessToken(tokenAcesso)
                        .refreshToken(tokenAtualizacao)
                        .build())
                .usuario(usuarioMapper.toResponse(usuario))
                .build();
    }

    @Override
    @Transactional
    public void verificarEmail(String codigo) {
        String hashToken = gerarHashString(codigo);
        TokenVerificacaoEmail token = tokenVerificacaoEmailRepository.findByTokenHash(hashToken)
                .orElseThrow(() -> new ExcecaoNegocio("Código inválido ou expirado.", HttpStatus.CONFLICT));

        if (token.getUtilizadoEm() != null || token.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new ExcecaoNegocio("Código inválido ou expirado.", HttpStatus.CONFLICT);
        }

        // Marca como usado
        token.setUtilizadoEm(LocalDateTime.now());
        tokenVerificacaoEmailRepository.save(token);

        // Ativa o usuário
        Usuario usuario = usuarioRepository.findById(token.getUsuarioId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        usuario.setEmailVerificado(true);
        usuario.setEmailVerificadoEm(LocalDateTime.now());
        usuario.setStatus(StatusUsuario.ATIVO);
        usuarioRepository.save(usuario);

        log.info("E-mail do usuário {} verificado com sucesso.", usuario.getEmail());
    }

    @Override
    @Transactional
    public RespostaToken renovarTokens(String refreshTokenString, String ip, String userAgent) {
        String hashToken = gerarHashString(refreshTokenString);

        TokenAtualizacao tokenAtualizacaoEntidade = tokenAtualizacaoRepository.findByTokenHash(hashToken)
                .orElseThrow(() -> new ExcecaoNegocio("Refresh token inválido ou expirado.", HttpStatus.UNAUTHORIZED));

        if (tokenAtualizacaoEntidade.getRevogadoEm() != null || tokenAtualizacaoEntidade.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new ExcecaoNegocio("Refresh token inválido ou expirado.", HttpStatus.UNAUTHORIZED);
        }

        // Revoga o token atual
        tokenAtualizacaoEntidade.setRevogadoEm(LocalDateTime.now());
        tokenAtualizacaoRepository.save(tokenAtualizacaoEntidade);

        // Busca o usuário e gera novos tokens
        Usuario usuario = usuarioRepository.findById(tokenAtualizacaoEntidade.getUsuarioId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        PrincipalUsuario principal = PrincipalUsuario.criar(usuario);
        String novoTokenAcesso = provedorTokenJwt.gerarToken(principal);
        String novoTokenAtualizacao = criarESalvarTokenAtualizacao(usuario.getId(), ip, userAgent);

        return RespostaToken.builder()
                .tokens(RespostaToken.TokensResponse.builder()
                        .accessToken(novoTokenAcesso)
                        .refreshToken(novoTokenAtualizacao)
                        .build())
                .build();
    }

    @Override
    @Transactional
    public void logout(String refreshTokenString) {
        String hashToken = gerarHashString(refreshTokenString);
        tokenAtualizacaoRepository.findByTokenHash(hashToken).ifPresent(token -> {
            token.setRevogadoEm(LocalDateTime.now());
            tokenAtualizacaoRepository.save(token);
        });
    }

    @Override
    @Transactional
    public void recuperarSenha(String email) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            // Silencioso por segurança, evitando enumeração de usuários
            log.warn("Tentativa de recuperarSenha para e-mail inexistente: {}", email);
            return;
        }

        Usuario usuario = usuarioOpt.get();
        String tokenRecuperacao = UUID.randomUUID().toString();
        String hashToken = gerarHashString(tokenRecuperacao);

        TokenRedefinicaoSenha tokenRedefinicaoEntidade = TokenRedefinicaoSenha.builder()
                .usuarioId(usuario.getId())
                .tokenHash(hashToken)
                .expiraEm(LocalDateTime.now().plusHours(1)) // 1 hora de validade
                .build();
        tokenRedefinicaoSenhaRepository.save(tokenRedefinicaoEntidade);

        // Mock do envio de e-mail no console
        log.info("------------------------------------------------------------------");
        log.info("[MOCK EMAIL SENDER] Recuperação de senha para: {}", usuario.getEmail());
        log.info("Olá {}, use o token abaixo para redefinir sua senha:", usuario.getNome());
        log.info("TOKEN: {}", tokenRecuperacao);
        log.info("------------------------------------------------------------------");
    }

    @Override
    @Transactional
    public void redefinirSenha(String tokenRecuperacao, String novaSenha) {
        String hashToken = gerarHashString(tokenRecuperacao);

        TokenRedefinicaoSenha token = tokenRedefinicaoSenhaRepository.findByTokenHash(hashToken)
                .orElseThrow(() -> new ExcecaoNegocio("Token inválido ou expirado.", HttpStatus.CONFLICT));

        if (token.getUtilizadoEm() != null || token.getExpiraEm().isBefore(LocalDateTime.now())) {
            throw new ExcecaoNegocio("Token inválido ou expirado.", HttpStatus.CONFLICT);
        }

        // Marca token como usado
        token.setUtilizadoEm(LocalDateTime.now());
        tokenRedefinicaoSenhaRepository.save(token);

        // Atualiza senha do usuário
        Usuario usuario = usuarioRepository.findById(token.getUsuarioId())
                .orElseThrow(() -> new ExcecaoRecursoNaoEncontrado("Usuário não encontrado."));

        usuario.setSenhaHash(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        log.info("Senha do usuário {} redefinida com sucesso.", usuario.getEmail());
    }

    // ─── Métodos Auxiliares Privados ───────────────────────────────

    private String criarESalvarTokenAtualizacao(UUID usuarioId, String ip, String userAgent) {
        String rawToken = UUID.randomUUID().toString();
        String hashToken = gerarHashString(rawToken);

        TokenAtualizacao tokenAtualizacao = TokenAtualizacao.builder()
                .usuarioId(usuarioId)
                .tokenHash(hashToken)
                .ip(ip)
                .userAgent(userAgent)
                .expiraEm(LocalDateTime.now().plusNanos(expiraRefreshMs * 1_000_000))
                .build();

        tokenAtualizacaoRepository.save(tokenAtualizacao);
        return rawToken;
    }

    private String gerarCodigo6Digitos() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    private String gerarHashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Erro ao gerar hash SHA-256", e);
        }
    }
}
