// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDBk7Njz9W1Gd6q97S-XtxqnXrkStbJZnk",
  authDomain: "super-fruit-center-69794.firebaseapp.com",
  projectId: "super-fruit-center-69794",
  storageBucket: "super-fruit-center-69794.appspot.com",
  messagingSenderId: "334494456886",
  appId: "1:334494456886:web:super-fruit-center-69794"
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