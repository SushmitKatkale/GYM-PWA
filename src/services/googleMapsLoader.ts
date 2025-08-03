import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

class GoogleMapsLoaderService {
  private static instance: GoogleMapsLoaderService;
  private loader: Loader | null = null;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): GoogleMapsLoaderService {
    if (!GoogleMapsLoaderService.instance) {
      GoogleMapsLoaderService.instance = new GoogleMapsLoaderService();
    }
    return GoogleMapsLoaderService.instance;
  }

  public async load(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured');
    }

    if (!this.loader) {
      this.loader = new Loader({
        apiKey: GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry', 'marker']
      });
    }

    this.loadPromise = this.loader.load().then(() => {
      this.isLoaded = true;
    });

    return this.loadPromise;
  }

  public isGoogleMapsLoaded(): boolean {
    return this.isLoaded;
  }

  public getApiKey(): string {
    return GOOGLE_MAPS_API_KEY;
  }
}

export const googleMapsLoader = GoogleMapsLoaderService.getInstance();
