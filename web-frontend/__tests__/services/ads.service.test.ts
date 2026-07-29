import { fetchBannerAds } from '@/services/ads.service';

// Mock global fetch
const originalFetch = global.fetch;

describe('Ads Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('returns local fallback banner when API returns 204 No Content', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await fetchBannerAds('HOME_TOP');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'fallback-home',
      imageUrl: '/banners/pecas-originais.png',
      linkUrl: '/busca',
      placement: 'home_top',
    });
  });

  it('returns valid banner from API', async () => {
    const apiResponse = {
      criativoId: 'uuid-123',
      urlImagem: 'https://cdn.pecae.com/banner-real.png',
      urlDestino: 'https://pecae.com/oferta',
      placement: 'HOME_TOP',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify(apiResponse)),
    });

    const result = await fetchBannerAds('HOME_TOP');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'uuid-123',
      imageUrl: 'https://cdn.pecae.com/banner-real.png',
      linkUrl: 'https://pecae.com/oferta',
      placement: 'home_top',
    });
  });

  it('replaces broken placeholder URLs with local fallback images', async () => {
    const apiResponse = {
      criativoId: 'uuid-123',
      urlImagem: 'https://via.placeholder.com/1200x250',
      urlDestino: 'https://pecae.com/oferta',
      placement: 'HOME_TOP',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify(apiResponse)),
    });

    const result = await fetchBannerAds('HOME_TOP');
    
    // The banner ID and link come from API, but the image is replaced by local fallback
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('uuid-123');
    expect(result[0].imageUrl).toBe('/banners/pecas-originais.png');
    expect(result[0].linkUrl).toBe('https://pecae.com/oferta');
  });

  it('returns fallback banner when fetch completely fails (Network Error)', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network offline'));

    const result = await fetchBannerAds('SEARCH_SIDEBAR');
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'fallback-search',
      placement: 'search_sidebar',
    });
  });
  
  it('returns fallback banner when API returns 500 Server Error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const result = await fetchBannerAds('HOME_TOP');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('fallback-home');
  });
});
