// PWA Service for handling service worker registration and push notifications

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

  // Register service worker
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.swRegistration = registration;
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, prompt user to refresh
                this.showUpdateAvailable();
              }
            });
          }
        });
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
    if (!this.swRegistration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const applicationServerKey = this.urlBase64ToUint8Array(
        'BN4jOQ1FqF5gHJwkYjW_VXqG8B8N2K4lQ7-mXYVm7bPJN8L9FHQ2R5mP0Xs8GHW_VYqF8L9N2K4lQ7-mXYVm7bP'
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
      const response = await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: this.getCurrentUserId()
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
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 16px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
      ">
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">Install FItEsperro</div>
          <div style="font-size: 14px; opacity: 0.9;">Get the full app experience</div>
        </div>
        <div>
          <button id="install-button" style="
            background: white;
            color: #2563eb;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            margin-right: 8px;
            font-weight: bold;
            cursor: pointer;
          ">Install</button>
          <button id="dismiss-button" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
          ">Later</button>
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

  // Get current user ID (implement based on your auth system)
  private getCurrentUserId(): string {
    // This should be implemented based on your authentication system
    return 'user-123';
  }

  // Initialize PWA features
  async initialize(): Promise<void> {
    await this.registerServiceWorker();
    this.handleAppInstall();
    
    // Request notification permission after user interaction
    setTimeout(async () => {
      const hasPermission = await this.requestNotificationPermission();
      if (hasPermission) {
        const subscription = await this.subscribeToPushNotifications();
        if (subscription) {
          await this.sendSubscriptionToServer(subscription);
        }
      }
    }, 5000); // Wait 5 seconds before requesting permission
  }
}

export const pwaService = new PWAService();
