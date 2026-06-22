package com.pecae.api.usuario.entities.enums;

/**
 * Define o status atual do ciclo de vida da conta do usuário.
 */
public enum StatusUsuario {
    PENDENTE_VERIFICACAO,
    ATIVO,
    SUSPENSO,
    BANIDO,
    DELETADO
}
