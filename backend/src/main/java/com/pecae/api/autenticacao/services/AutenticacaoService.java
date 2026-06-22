package com.pecae.api.autenticacao.services;

import com.pecae.api.autenticacao.dtos.*;

/**
 * Interface que define os serviços de autenticação e identidade.
 */
public interface AutenticacaoService {

    /**
     * Registra um novo usuário com e-mail/senha convencionais.
     */
    RespostaAutenticacao registrar(RegistroRequest request, String ip, String userAgent);

    /**
     * Realiza a autenticação de login de um usuário e-mail/senha.
     */
    RespostaAutenticacao login(LoginRequest request, String ip, String userAgent);

    /**
     * Valida o e-mail de um usuário pelo código de 6 dígitos.
     */
    void verificarEmail(String codigo);

    /**
     * Renova o par de tokens a partir de um refresh token válido.
     */
    RespostaToken renovarTokens(String refreshTokenString, String ip, String userAgent);

    /**
     * Revoga um refresh token no logout.
     */
    void logout(String refreshTokenString);

    /**
     * Solicita redefinição de senha e gera token.
     */
    void recuperarSenha(String email);

    /**
     * Redefine a senha de um usuário com base no token de recuperação.
     */
    void redefinirSenha(String tokenRecuperacao, String novaSenha);
}
