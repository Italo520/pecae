export const QUERY_DEFAULTS = {
  staleTime: {
    STATIC: Infinity,      // Marcas, modelos (mudam raramente)
    CATALOG: 5 * 60_000,   // Catálogo geral (5 min)
    LISTINGS: 60_000,      // Listagens (1 min)
    USER: 2 * 60_000,      // Dados do usuário (2 min)
  },
} as const;
