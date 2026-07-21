export const API_VERSION = 'v1';
export const API_BASE_PATH = '/api/v1';
export const ACCESS_TOKEN_TTL_MS = 15 * 60_000; // 15 minutos em ms

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    GOOGLE: '/auth/google',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    ME: '/users/me',
    PUSH_TOKEN: '/users/push-token',
  },
  VEHICLES: {
    ME: '/vehicles/me',
    CREATE: '/vehicles',
    DETAIL: (id: string) => `/vehicles/${id}`,
    UPLOAD_PHOTO: (id: string) => `/vehicles/${id}/photos/upload-url`,
    CONFIRM_PHOTO: (id: string) => `/vehicles/${id}/photos/confirm`,
    DELETE: (id: string) => `/vehicles/me/${id}`,
  },
  CATALOG: {
    BRANDS: '/catalog/brands',
    MODELS: (brandId: string) => `/catalog/brands/${brandId}/models`,
    VERSIONS: (modelId: string) => `/catalog/models/${modelId}/versions`,
    YEARS: (versionId: string) => `/catalog/versions/${versionId}/years`,
    PART_CATEGORIES: '/catalog/part-categories',
  },
  LISTINGS: {
    SEARCH: '/listings',
    RECOMMENDED: '/listings/recommended',
    DETAIL: (id: string) => `/listings/${id}`,
    MY_DETAIL: (id: string) => `/listings/me/${id}`,
  },
  BUYERS: {
    FAVORITES: '/buyers/favorites',
    FAVORITE_BY_ID: (listingId: string) => `/buyers/favorites/${listingId}`,
    SAVED_SEARCHES: '/buyers/saved-searches',
    SAVED_SEARCH_BY_ID: (id: string) => `/buyers/saved-searches/${id}`,
    UPDATE_ME: '/buyers/me',
  },
  ADS: {
    CAMPAIGNS: '/ads/campaigns',
    SERVE: (placement: string) => `/ads/serve/${placement}`,
    CLICK: (id: string) => `/ads/${id}/click`,
    TRACK_IMPRESSION: '/ads/track/impression',
    TRACK_CLICK: '/ads/track/click',
    INTERSTITIAL_STATUS: (userId: string) => `/ads/interstitial/status/${userId}`,
  },
  MODERATION: {
    LISTINGS: '/moderacao/anuncios/pendentes',
    APPROVE_LISTING: (id: string) => `/moderacao/anuncios/${id}/decisao`,
    REJECT_LISTING: (id: string) => `/moderacao/anuncios/${id}/decisao`,
    VERIFICATIONS: '/moderacao/verificacoes',
    APPROVE_VERIFICATION: (id: string) => `/moderacao/verificacoes/${id}/decisao`,
    REJECT_VERIFICATION: (id: string) => `/moderacao/verificacoes/${id}/decisao`,
  },
  DENUNCIAS: '/denuncias',
} as const;
