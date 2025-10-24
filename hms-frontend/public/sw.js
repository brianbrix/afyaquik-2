/**
 * Service Worker for Offline Functionality
 * Caches application resources for offline access
 */

const CACHE_NAME = 'afyaquik-hms-v1';
const STATIC_CACHE_NAME = 'afyaquik-hms-static-v1';
const DYNAMIC_CACHE_NAME = 'afyaquik-hms-dynamic-v1';

// Memory management configuration
const CACHE_CONFIG = {
  MAX_CACHE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_ENTRIES: 1000,
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  COMPRESSION_THRESHOLD: 10 * 1024, // 10KB
  CACHE_AGE_LIMIT: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Files to cache for offline access 
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  // Add other static assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/v1\/patients/,
  /\/api\/v1\/staff/,
  /\/api\/v1\/departments/,
  /\/api\/v1\/appointments/,
  /\/api\/v1\/medications/,
  /\/api\/v1\/queue/,
  /\/api\/v1\/snapshots/
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Memory management functions
async function getCacheSize(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  let totalSize = 0;
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return totalSize;
}

async function performCacheCleanup() {
  const caches = await caches.keys();
  
  for (const cacheName of caches) {
    const size = await getCacheSize(cacheName);
    
    if (size > CACHE_CONFIG.MAX_CACHE_SIZE) {
      console.log(`Cache ${cacheName} size: ${size} bytes, cleaning up...`);
      await cleanupCache(cacheName);
    }
  }
}

async function cleanupCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // Sort by date (oldest first)
  const sortedKeys = await Promise.all(
    keys.map(async (request) => {
      const response = await cache.match(request);
      const date = response?.headers.get('date') || '0';
      return { request, date: new Date(date).getTime() };
    })
  );
  
  sortedKeys.sort((a, b) => a.date - b.date);
  
  // Remove oldest entries
  const toRemove = sortedKeys.slice(0, Math.floor(sortedKeys.length * 0.3));
  await Promise.all(toRemove.map(({ request }) => cache.delete(request)));
}

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
      .then(() => {
        // Perform initial cache cleanup
        return performCacheCleanup();
      })
  );
});

// Periodic cleanup - run every 24 hours
setInterval(() => {
  performCacheCleanup();
}, CACHE_CONFIG.CLEANUP_INTERVAL);

// Listen for memory cleanup requests from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MEMORY_CLEANUP_REQUEST') {
    performCacheCleanup();
  }
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static file requests
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // For other requests, try network first
  event.respondWith(fetch(request));
});

/**
 * Handle API requests with cache-first strategy
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this is a cacheable API endpoint
  const isCacheable = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!isCacheable) {
    // For non-cacheable endpoints, try network first
    try {
      return await fetch(request);
    } catch (error) {
      console.log('Service Worker: Network failed for', url.pathname);
      return new Response('Network error', { status: 503 });
    }
  }

  // For cacheable endpoints, try cache first
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache', url.pathname);
      return cachedResponse;
    }

    // If not in cache, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      // Only cache GET requests (POST, PUT, DELETE are not cacheable)
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('Service Worker: Cached response for', url.pathname);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Service Worker: Network failed for', url.pathname);
    
    // Try to serve from cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Service Worker: Serving cached fallback for', url.pathname);
      return cachedResponse;
    }
    
    return new Response('Offline - No cached data available', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Handle static file requests with cache-first strategy
 */
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('Service Worker: Network failed for static file', request.url);
    
    // For navigation requests, serve the main page
    if (request.mode === 'navigate') {
      const cachedResponse = await caches.match('/index.html');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    return new Response('Offline - Resource not available', { 
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * Handle background sync for offline data
 */
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'upload-offline-data') {
    event.waitUntil(uploadOfflineData());
  }
});

/**
 * Upload offline data when connection is restored
 */
async function uploadOfflineData() {
  try {
    console.log('Service Worker: Attempting to upload offline data');
    
    // Notify the main thread to start upload
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'UPLOAD_OFFLINE_DATA',
        data: { trigger: 'background-sync' }
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Failed to upload offline data', error);
  }
}

/**
 * Handle push notifications
 */
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'afyaquik-notification',
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification('AfyaQuik HMS', options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

/**
 * Handle message from main thread
 */
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_API_RESPONSE') {
    const { request, response } = event.data;
    // Only cache GET requests
    if (request.method === 'GET') {
      caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        cache.put(request, response);
      });
    }
  }
});
