package com.pecae.api.compartilhado.excecao;

import java.time.Instant;
import java.util.List;

/**
 * Record imutável para respostas de erro padronizadas da API.
 * Garante formato consistente em todos os endpoints.
 */
public record RespostaErro(
        int status,
        String erro,
        String mensagem,
        String caminho,
        Instant timestamp,
        List<ErroCampo> errosCampos
) {

    /**
     * Construtor simplificado sem erros de campos.
     */
    public RespostaErro(int status, String erro, String mensagem, String caminho) {
        this(status, erro, mensagem, caminho, Instant.now(), null);
    }

    /**
     * Record para erros de validação de campos individuais.
     */
    public record ErroCampo(String campo, String mensagem) {
    }
}
