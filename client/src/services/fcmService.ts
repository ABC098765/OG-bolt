import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import app from '../config/firebase';

class FCMService {
  private messaging: any = null;

  constructor() {
    try {
      this.messaging = getMessaging(app);
    } catch (error) {
      console.error('Error initializing FCM:', error);
    }
  }

  // Request notification permission and get FCM token
  async requestPermissionAndGetToken(userId: string): Promise<string | null> {
    try {
      console.log('🔔 FCM: Starting permission request for user:', userId);
      
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('❌ FCM: This browser does not support notifications');
        return null;
      }

      // Check current permission status
      let permission = Notification.permission;
      console.log('🔔 FCM: Current permission status:', permission);

      // Request permission if not granted
      if (permission !== 'granted') {
        console.log('🔔 FCM: Requesting notification permission...');
        permission = await Notification.requestPermission();
        console.log('🔔 FCM: Permission result:', permission);
      }
      
      if (permission !== 'granted') {
        console.log('❌ FCM: Notification permission denied');
        return null;
      }

      if (!this.messaging) {
        console.error('❌ FCM: Messaging not initialized');
        return null;
      }

      console.log('🔔 FCM: Getting FCM token...');
      
      // Wait for service worker to be ready and use it for FCM
      const registration = await navigator.serviceWorker.ready;
      console.log('🔔 FCM: Service worker ready, using registration:', registration.scope);
      
      // Get FCM token - using a placeholder VAPID key for now
      const token = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || undefined, // Use environment variable for VAPID key
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('✅ FCM: Token received:', token.substring(0, 20) + '...');
        
        // Save token to Firestore user document
        await this.saveTokenToFirestore(userId, token);
        
        return token;
      } else {
        console.log('❌ FCM: No registration token available. Check VAPID key configuration.');
        console.log('VAPID key present:', !!import.meta.env.VITE_FIREBASE_VAPID_KEY);
        return null;
      }
    } catch (error) {
      console.error('❌ FCM: Error getting token:', error);
      
      // Show user-friendly error messages
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === 'messaging/unsupported-browser') {
          console.error('❌ FCM: Browser not supported for notifications');
        } else if (errorCode === 'messaging/permission-blocked') {
          console.error('❌ FCM: Notification permission blocked by user');
        } else if (errorCode === 'messaging/vapid-key-required') {
          console.error('❌ FCM: VAPID key required but not provided');
        }
      }
      
      return null;
    }
  }

  // Save FCM token to user document in Firestore
  private async saveTokenToFirestore(userId: string, token: string): Promise<void> {
    try {
      console.log('💾 FCM: Saving token to Firestore for user:', userId);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcm_token: token,
        last_token_update: serverTimestamp()
      });
      console.log('✅ FCM: Token saved to Firestore successfully');
    } catch (error) {
      console.error('❌ FCM: Error saving token to Firestore:', error);
    }
  }

  // Listen for foreground messages
  onMessage(callback: (payload: any) => void) {
    try {
      if (!this.messaging) {
        console.log('❌ FCM: Messaging not initialized, cannot listen for messages');
        return;
      }

      console.log('👂 FCM: Setting up foreground message listener');
      onMessage(this.messaging, (payload) => {
        try {
          console.log('📨 FCM: Message received in foreground:', payload);
          callback(payload);
        } catch (error) {
          console.error('❌ FCM: Error in message callback:', error);
        }
      });
    } catch (error) {
      console.error('❌ FCM: Error setting up message listener:', error);
    }
  }

  // Show notification manually (for foreground messages)
  showNotification(title: string, body: string, icon?: string) {
    try {
      console.log('🔔 FCM: Showing notification:', { title, body });
      
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: icon || '/vite.svg',
          badge: '/vite.svg',
          requireInteraction: true
        });
        
        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
        
        return notification;
      } else {
        console.log('❌ FCM: Cannot show notification - permission not granted');
      }
    } catch (error) {
      console.error('❌ FCM: Error showing notification:', error);
    }
  }

  // Test notification function
  async testNotification(): Promise<void> {
    console.log('🧪 FCM: Testing notification...');
    this.showNotification('Test Notification', 'This is a test notification from Super Fruit Center');
  }

  // Debug function to check FCM status
  async debugFCMStatus(userId: string): Promise<void> {
    console.log('🔍 FCM Debug Status:');
    console.log('- Browser supports notifications:', 'Notification' in window);
    console.log('- Permission status:', Notification.permission);
    console.log('- Messaging initialized:', !!this.messaging);
    console.log('- Service Worker registered:', 'serviceWorker' in navigator);
    
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('- Service Worker registrations:', registrations.length);
      registrations.forEach((reg, index) => {
        console.log(`  ${index + 1}. ${reg.scope}`);
      });
    }
    
    // Check if user has FCM token in Firestore
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('- User has FCM token in Firestore:', !!userData.fcm_token);
        if (userData.fcm_token) {
          console.log('- Token preview:', userData.fcm_token.substring(0, 20) + '...');
        }
      }
    } catch (error) {
      console.error('- Error checking Firestore token:', error);
    }
  }
}

export const fcmService = new FCMService();