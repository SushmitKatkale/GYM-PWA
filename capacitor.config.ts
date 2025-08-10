import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitespero.app',
  appName: 'FItEspero - Fitness Management',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2563eb',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#2563eb'
    }
  }
};

export default config;
