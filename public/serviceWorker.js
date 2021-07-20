const staticCache = 'v1';
const dynamicCache = 'dynamic-cache';
// assets to cache
const assets = [
    '/',
    '/index.html',
    // '/js/index.js',
    '/fallback.html'
];

// ==================================
const limitCacheSize = (name, size) => {
    // console.log('limit cache size')
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            // console.log(keys)
            if (keys.length > size) {
                // console.log('delete')
                cache.delete(keys[0]).then(limitCacheSize(name, size));

            }
        })
    })
}
const limitNumCache = (cacheName, num) => {
    caches.open(cacheName).then(cache => {
        cache.keys().then(keys => {
            if (keys.length > num) {
                cache.delete(keys[0]).then(limitNumCache(cacheName, num));

            }
        })
    })
}
// ===============================

//install process
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(staticCache)
            .then(cache => {
                cache.addAll(assets)
            })
    )
})

//activate 
self.addEventListener('activate', e => {

})


// fetching data
self.addEventListener('fetch', e => {
    if (e.request.url.indexOf('firestore.googleapis.com') === -1) {
        e.respondWith(
            caches.match(e.request).then(staticRes => {
                return staticRes || fetch(e.request).then(dynamicRes => {
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(e.request.url, dynamicRes.clone())
                        limitCacheSize(dynamicCache, 20)
                        return dynamicRes
                    })
                })
            }).catch(() => caches.match('/fallback.html'))
        )
    }

})


// ESTRATEGIA TOMADA DE WEB
/* self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open(cacheName).then(function(cache) {
                cache.match(event.request).then( function(cacheResponse) {
                        fetch(event.request).then(function(networkResponse) {
                                cache.put(event.request, networkResponse)
                            })
                        return cacheResponse || networkResponse
                    })
            })
    )
}); */