// PWA Service for handling service worker registration and push notifications
import { registerSW } from 'virtual:pwa-register';
import { API_BASE_URL } from '../config/api';

declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

class PWAService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  // Register service worker using vite-plugin-pwa
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const updateSW = registerSW({
          onNeedRefresh() {
            // New content is available, prompt user to refresh
            console.log('New content available, please refresh');
          },
          onOfflineReady() {
            console.log('App ready to work offline');
          },
          onRegistered(registration) {
            console.log('Service Worker registered successfully:', registration);
          },
          onRegisterError(error) {
            console.error('Service Worker registration failed:', error);
          }
        });
        
        // Get the service worker registration for push notifications
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          this.swRegistration = await navigator.serviceWorker.ready;
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      // Ensure service worker is registered
      if (!this.swRegistration) {
        if ('serviceWorker' in navigator) {
          this.swRegistration = await navigator.serviceWorker.ready;
        } else {
          console.error('Service Worker not supported');
          return null;
        }
      }

      // Check if already subscribed
      const existingSubscription = await this.swRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        return existingSubscription;
      }

      const applicationServerKey = this.urlBase64ToUint8Array(
        'BBAtF5cCXdW-1o3IFkn_uPr8-tqqfKg7g4GwB40PyhoTFJ5BB55HCtQjsH8vEQ2wRdwcaA0j1XyIRsGZbKqCQIs'
      );

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // Get the token from auth storage (same format as apiClient)
      let token = null;
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.tokens?.accessToken;
        }
      } catch (error) {
        console.warn('Failed to get token from auth storage:', error);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          subscription: subscription,
          deviceInfo: {
            userAgent: navigator.userAgent
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  // Show local notification
  showLocalNotification(title: string, options: ExtendedNotificationOptions = {}): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        ...options
      } as ExtendedNotificationOptions);
    }
  }

  // Show update available notification
  private showUpdateAvailable(): void {
    this.showLocalNotification('Update Available', {
      body: 'A new version of FItEsperro is available. Refresh to update.',
      tag: 'update-available',
      requireInteraction: true
    });
  }

  // Check if app is running in standalone mode
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           ('standalone' in window.navigator && (window.navigator as any).standalone) ||
           document.referrer.includes('android-app://');
  }

  // Show install prompt
  async showInstallPrompt(): Promise<void> {
    // This will be triggered by the beforeinstallprompt event
    console.log('Install prompt would be shown here');
  }

  // Handle app install
  handleAppInstall(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      
      // Store the event so it can be triggered later
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Show custom install button/banner
      this.showInstallBanner();
    });

    window.addEventListener('appinstalled', () => {
      console.log('FItEsperro was installed successfully');
      this.hideInstallBanner();
    });
  }

  private showInstallBanner(): void {
    // Create and show custom install banner
    const banner = document.createElement('div');
    banner.id = 'install-banner';
banner.innerHTML = `
  <div style="
    position: fixed;
    bottom: 16px;
    left: 16px;
    right: 16px;
    background: #2563eb;
    color: white;
    padding: 16px;
    border-radius: 12px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    font-family: system-ui, sans-serif;
  ">
    <div style="flex: 1; min-width: 180px;">
      <div style="font-weight: 600; font-size: 16px; margin-bottom: 2px;">
        Install FitEsperro
      </div>
      <div style="font-size: 14px; opacity: 0.9;">
        Get the full app experience
      </div>
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end;">
      <button id="install-button" style="
        background: white;
        color: #2563eb;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        flex: 1;
        min-width: 100px;
      ">
        Install
      </button>
      <button id="dismiss-button" style="
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        flex: 1;
        min-width: 100px;
      ">
        Later
      </button>
    </div>
  </div>
`;


    document.body.appendChild(banner);

    // Handle install button click
    document.getElementById('install-button')?.addEventListener('click', async () => {
      const deferredPrompt = window.deferredPrompt;
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        window.deferredPrompt = null;
      }
      this.hideInstallBanner();
    });

    // Handle dismiss button click
    document.getElementById('dismiss-button')?.addEventListener('click', () => {
      this.hideInstallBanner();
    });
  }

  private hideInstallBanner(): void {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get current user email from auth store
  private getCurrentUserEmail(): string | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || null;
    } catch {
      return null;
    }
  }

  // Initialize PWA features
  async initialize(): Promise<void> {
    await this.registerServiceWorker();
    this.handleAppInstall();
    
    // Don't auto-request permission, let user explicitly enable through UI
    console.log('PWA service initialized');
  }

  // Method to check if push notifications are supported
  isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  // Get current subscription status
  async getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!this.isPushNotificationSupported()) {
      return null;
    }

    try {
      if (!this.swRegistration) {
        this.swRegistration = await navigator.serviceWorker.ready;
      }
      return await this.swRegistration.pushManager.getSubscription();
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }
}

export const pwaService = new PWAService();
