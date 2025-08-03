// Sample gym data for testing purposes
export const sampleGyms = [
  {
    id: '1',
    name: 'FitZone Downtown',
    address: '123 Main Street, New York, NY 10001',
    latitude: 40.7506,
    longitude: -73.9972,
    rating: 4.5,
    image: '/images/gym1.jpg',
    description: 'Modern fitness center with state-of-the-art equipment and professional trainers.',
    amenities: ['Pool', 'Sauna', 'Gym Equipment', 'Personal Training'],
    operatingHours: {
      open: '06:00',
      close: '22:00'
    },
    plans: {
      daily: 15,
      weekly: 50,
      monthly: 120,
      yearly: 1200
    },
    ownerId: 'owner1',
    capacity: 150,
    currentOccupancy: 87
  },
  {
    id: '2',
    name: 'PowerHouse Gym',
    address: '456 Oak Avenue, Brooklyn, NY 11201',
    latitude: 40.6892,
    longitude: -73.9442,
    rating: 4.2,
    image: '/images/gym2.jpg',
    description: 'Hardcore training facility for serious athletes and bodybuilders.',
    amenities: ['Gym Equipment', 'Personal Training', 'Cafeteria'],
    operatingHours: {
      open: '05:00',
      close: '23:00'
    },
    plans: {
      daily: 20,
      weekly: 70,
      monthly: 150,
      yearly: 1500
    },
    ownerId: 'owner2',
    capacity: 200,
    currentOccupancy: 134
  },
  {
    id: '3',
    name: 'Wellness Studio',
    address: '789 Pine Street, Manhattan, NY 10002',
    latitude: 40.7128,
    longitude: -74.0060,
    rating: 4.8,
    image: '/images/gym3.jpg',
    description: 'Holistic wellness center focusing on yoga, pilates, and mindful fitness.',
    amenities: ['Sauna', 'Pool', 'Cafeteria'],
    operatingHours: {
      open: '07:00',
      close: '21:00'
    },
    plans: {
      daily: 25,
      weekly: 80,
      monthly: 180,
      yearly: 1800
    },
    ownerId: 'owner3',
    capacity: 100,
    currentOccupancy: 42
  },
  {
    id: '4',
    name: 'CrossFit Central',
    address: '321 Elm Drive, Queens, NY 11101',
    latitude: 40.7282,
    longitude: -73.7949,
    rating: 4.6,
    image: '/images/gym4.jpg',
    description: 'High-intensity CrossFit training with certified coaches.',
    amenities: ['Gym Equipment', 'Personal Training'],
    operatingHours: {
      open: '06:30',
      close: '21:30'
    },
    plans: {
      daily: 30,
      weekly: 100,
      monthly: 200,
      yearly: 2000
    },
    ownerId: 'owner4',
    capacity: 80,
    currentOccupancy: 56
  },
  {
    id: '5',
    name: 'AquaFit Center',
    address: '654 Water Lane, Staten Island, NY 10301',
    latitude: 40.6437,
    longitude: -74.0834,
    rating: 4.3,
    image: '/images/gym5.jpg',
    description: 'Premium aquatic fitness center with Olympic-size pool and water aerobics.',
    amenities: ['Pool', 'Sauna', 'Gym Equipment', 'Cafeteria', 'Personal Training'],
    operatingHours: {
      open: '05:30',
      close: '22:30'
    },
    plans: {
      daily: 18,
      weekly: 60,
      monthly: 140,
      yearly: 1400
    },
    ownerId: 'owner5',
    capacity: 120,
    currentOccupancy: 78
  }
];

export default sampleGyms;
