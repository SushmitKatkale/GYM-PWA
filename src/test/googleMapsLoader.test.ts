import { describe, it, expect } from 'vitest';
import { googleMapsLoader } from '../services/googleMapsLoader';

describe('GoogleMapsLoaderService', () => {
  describe('singleton behavior', () => {
    it('should return the same instance', () => {
      const instance1 = googleMapsLoader;
      const instance2 = googleMapsLoader;
      expect(instance1).toBe(instance2);
    });
  });

  describe('getApiKey', () => {
    it('should return the API key from environment', () => {
      const apiKey = googleMapsLoader.getApiKey();
      expect(typeof apiKey).toBe('string');
    });
  });

  describe('isGoogleMapsLoaded', () => {
    it('should return false initially', () => {
      expect(googleMapsLoader.isGoogleMapsLoaded()).toBe(false);
    });
  });

  describe('core functionality', () => {
    it('should have a load method', () => {
      expect(typeof googleMapsLoader.load).toBe('function');
    });
  
    it('should have isGoogleMapsLoaded method', () => {
      expect(typeof googleMapsLoader.isGoogleMapsLoaded).toBe('function');
    });
  
    it('should have getApiKey method', () => {
      expect(typeof googleMapsLoader.getApiKey).toBe('function');
    });
  });
});
