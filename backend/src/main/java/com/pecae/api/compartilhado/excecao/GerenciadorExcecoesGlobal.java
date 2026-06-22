package com.pecae.api.compartilhado.excecao;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Manipulador global de exceções que padroniza todas as respostas de erro da API.
 * Captura exceções de negócio, validação, segurança e erros inesperados.
 */
@RestControllerAdvice
public class GerenciadorExcecoesGlobal {

    private static final Logger log = LoggerFactory.getLogger(GerenciadorExcecoesGlobal.class);

    /**
     * Erros de lógica de negócio (ExcecaoNegocio e subclasses).
     */
    @ExceptionHandler(ExcecaoNegocio.class)
    public ResponseEntity<RespostaErro> tratarExcecaoNegocio(
            ExcecaoNegocio ex, HttpServletRequest request) {

        var resposta = new RespostaErro(
                ex.getStatus().value(),
                ex.getStatus().getReasonPhrase(),
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(ex.getStatus()).body(resposta);
    }

    /**
     * Erros de validação de DTOs (@Valid).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespostaErro> tratarExcecaoValidacao(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<RespostaErro.ErroCampo> errosCampos = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new RespostaErro.ErroCampo(
                        error.getField(),
                        error.getDefaultMessage()))
                .toList();

        var resposta = new RespostaErro(
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                "Erro de Validacao",
                "Erros de validação nos campos enviados.",
                request.getRequestURI(),
                java.time.Instant.now(),
                errosCampos
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(resposta);
    }

    /**
     * Credenciais inválidas (login falho).
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<RespostaErro> tratarCredenciaisInvalidas(
            BadCredentialsException ex, HttpServletRequest request) {

        var resposta = new RespostaErro(
                HttpStatus.UNAUTHORIZED.value(),
                "Nao Autorizado",
                "Credenciais inválidas.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(resposta);
    }

    /**
     * Acesso negado (permissão insuficiente).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<RespostaErro> tratarAcessoNegado(
            AccessDeniedException ex, HttpServletRequest request) {

        var resposta = new RespostaErro(
                HttpStatus.FORBIDDEN.value(),
                "Proibido",
                "Acesso negado. Permissão insuficiente.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(resposta);
    }

    /**
     * Argumento ilegal (parâmetros inválidos).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<RespostaErro> tratarArgumentoIlegal(
            IllegalArgumentException ex, HttpServletRequest request) {

        var resposta = new RespostaErro(
                HttpStatus.BAD_REQUEST.value(),
                "Requisicao Invalida",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resposta);
    }

    /**
     * Erros inesperados (catch-all).
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespostaErro> tratarExcecaoGenerica(
            Exception ex, HttpServletRequest request) {

        log.error("Erro inesperado em {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        var resposta = new RespostaErro(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erro Interno do Servidor",
                "Erro interno do servidor. Tente novamente mais tarde.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resposta);
    }
}
