package com.pecae.api.anuncio.entities.enums;

/**
 * Define o ciclo de vida de um anúncio.
 * Nomes físicos no DB permanecem em inglês para compatibilidade com Supabase.
 */
public enum StatusAnuncio {
    RASCUNHO,   // "DRAFT"     — criado mas não submetido (futuro)
    PENDENTE,   // "PENDING"   — aguardando moderação (RN14: status inicial)
    PUBLICADO,  // "PUBLISHED" — visível publicamente
    VENDIDO,    // "SOLD"      — transação concluída
    EXPIRADO,   // "EXPIRED"   — prazo expirado ou removido pelo vendedor
    REJEITADO   // "REJEITADO"  — rejeitado pela moderação
}
