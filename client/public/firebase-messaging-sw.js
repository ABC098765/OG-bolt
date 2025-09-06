// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyBcenzLE1BSgtC6zs1Iat0DUb-OKgvu_w4",
  authDomain: "superfruitcenter1979.firebaseapp.com",
  projectId: "superfruitcenter1979",
  storageBucket: "superfruitcenter1979.firebasestorage.app",
  messagingSenderId: "352081158916",
  appId: "1:352081158916:web:36e178fa7ec061f092a651"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/vite.svg',
    badge: '/vite.svg',
    tag: 'super-fruit-center',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Order'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});