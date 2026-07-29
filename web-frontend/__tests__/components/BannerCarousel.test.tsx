import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { AdBanner } from '@/types/listing.types';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} data-testid="next-image" onError={props.onError} />;
  },
}));

describe('BannerCarousel Component', () => {
  const mockAds: AdBanner[] = [
    {
      id: '1',
      imageUrl: '/test-banner-1.jpg',
      linkUrl: '/promo-1',
      placement: 'home_top',
    },
    {
      id: '2',
      imageUrl: '/test-banner-2.jpg',
      linkUrl: '/promo-2',
      placement: 'home_top',
    },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders nothing when ads array is empty', () => {
    const { container } = render(<BannerCarousel ads={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ads and initial state correctly', () => {
    render(<BannerCarousel ads={mockAds} />);
    
    // Check main section exists
    const section = screen.getByRole('region', { name: /Anúncios em destaque/i });
    expect(section).toBeInTheDocument();

    // Check images are rendered
    const images = screen.getAllByTestId('next-image');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', '/test-banner-1.jpg');
    expect(images[1]).toHaveAttribute('src', '/test-banner-2.jpg');
  });

  it('auto-rotates banners every 5 seconds', () => {
    render(<BannerCarousel ads={mockAds} />);
    
    // Initial state: ad 0 is active (opacity-100)
    const links = screen.getAllByRole('link');
    expect(links[0].className).toContain('opacity-100');
    expect(links[1].className).toContain('opacity-0');

    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Ad 1 should be active now
    expect(links[0].className).toContain('opacity-0');
    expect(links[1].className).toContain('opacity-100');
  });

  it('pauses rotation when hovered', () => {
    render(<BannerCarousel ads={mockAds} />);
    
    const section = screen.getByRole('region', { name: /Anúncios em destaque/i });
    
    // Hover
    fireEvent.mouseEnter(section);
    
    // Fast-forward 5 seconds
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still be on ad 0
    const links = screen.getAllByRole('link');
    expect(links[0].className).toContain('opacity-100');
  });

  it('allows manual navigation via dots', () => {
    render(<BannerCarousel ads={mockAds} />);
    
    // Click second dot
    const dot2 = screen.getByLabelText('Ir para o anúncio 2');
    fireEvent.click(dot2);

    const links = screen.getAllByRole('link');
    expect(links[0].className).toContain('opacity-0');
    expect(links[1].className).toContain('opacity-100');
  });

  it('displays fallback UI when image fails to load', () => {
    render(<BannerCarousel ads={[mockAds[0]]} />);
    
    const image = screen.getByTestId('next-image');
    
    // Simulate image error
    fireEvent.error(image);

    // Fallback text should appear
    expect(screen.getByText('Anúncio Patrocinado')).toBeInTheDocument();
    
    // Image should be removed
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });
});
