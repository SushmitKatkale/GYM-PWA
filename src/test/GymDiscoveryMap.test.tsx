import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { GymDiscoveryMap } from '../components/common/GymDiscoveryMap';
import type { Gym } from '../services/gymService';

// Mock googleMapsLoader
vi.mock('../services/googleMapsLoader', () => ({
  googleMapsLoader: {
    load: vi.fn().mockResolvedValue({}),
    isGoogleMapsLoaded: vi.fn(() => false),
  },
}));

describe('GymDiscoveryMap Component', () => {
  const mockGym: Partial<Gym> = {
    id: '1',
    name: 'Test Gym',
    address: '123 Test Street',
    latitude: 12.9716,
    longitude: 77.5946,
    rating: 4.5,
  };

  it('should render without crashing', () => {
    const { container } = render(<GymDiscoveryMap gyms={[]} />);
    expect(container).toBeInTheDocument();
  });

  it('should render with gyms prop', () => {
    const { container } = render(<GymDiscoveryMap gyms={[mockGym as Gym]} />);
    expect(container).toBeInTheDocument();
  });

  it('should render with user location props', () => {
    const userLocation = { lat: 12.9716, lng: 77.5946 };
    const { container } = render(
      <GymDiscoveryMap 
        gyms={[]} 
        showUserLocation={true} 
        userLocation={userLocation} 
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    const { container } = render(
      <GymDiscoveryMap 
        gyms={[mockGym as Gym]} 
        center={{ lat: 40.7128, lng: -74.006 }} 
        zoom={10}
        height="400px"
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('should accept onGymSelect callback', () => {
    const onGymSelect = vi.fn();
    const { container } = render(
      <GymDiscoveryMap 
        gyms={[mockGym as Gym]} 
        onGymSelect={onGymSelect} 
      />
    );
    expect(container).toBeInTheDocument();
  });
});

