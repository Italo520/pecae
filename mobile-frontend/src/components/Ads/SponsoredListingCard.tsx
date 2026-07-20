import React, { useEffect } from 'react';
import { api } from '../../services/api';
import { useRouter } from 'expo-router';
import { VehicleCard } from '../Vehicle';

interface SponsoredListingCardProps {
  vehicle: any;
  style?: any;
  variant?: 'grid' | 'list';
}

export const SponsoredListingCard: React.FC<SponsoredListingCardProps> = ({ 
  vehicle, 
  style,
  variant = 'grid'
}) => {
  const router = useRouter();

  const brand = vehicle.version?.model?.brand?.name || vehicle.brand || '';
  const model = vehicle.version?.model?.name || vehicle.model || '';
  const version = vehicle.version?.name || '';
  const imageUrl = vehicle.thumbnail || (vehicle.photos && vehicle.photos.length > 0 ? vehicle.photos[0] : null);
  const campaignId = vehicle.campaignId;
  const listingId = vehicle.id;

  useEffect(() => {
    if (campaignId && listingId) {
      const trackImpression = async () => {
        try {
          await api.post('/ads/track/impression', {
            campaignId,
            listingId
          });
        } catch (error) {
          console.warn('Failed to track ad impression:', error);
        }
      };
      trackImpression();
    }
  }, [campaignId, listingId]);

  const handlePress = async () => {
    if (campaignId && listingId) {
      try {
        api.post('/ads/track/click', {
          campaignId,
          listingId
        }).catch(err => console.warn('Failed to track ad click:', err));
      } catch (e) {}
    }
    router.push(`/(tabs)/vehicle/${vehicle.vehicleId || vehicle.id}`);
  };

  return (
    <VehicleCard
      id={vehicle.vehicleId || vehicle.id}
      brand={brand}
      model={model}
      version={version}
      year={vehicle.year}
      mileage={vehicle.mileage}
      fuel={vehicle.fuelType}
      city={vehicle.city}
      state={vehicle.state}
      imageUrl={imageUrl}
      isSponsored={true}
      variant={variant}
      onPress={handlePress}
      style={style || { marginBottom: 24 }}
    />
  );
};
