let staticCacheName = 'wittr-static-v2';

self.addEventListener('install', function (event) {
    const urlsToCache = [
        '/',
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.googleapis.com/css?family=Dosis:400,500,600,700%7COpen+Sans:400,600,700'
    ];

    event.waitUntil(
        // param 1
        caches.open(staticCacheName).then(function (cache) {
            // addAll() returns a promise
            return cache.addAll([
                '/',
                'js/main.js',
                'css/main.css',
                'imgs/icon.png',
                'https://fonts.googleapis.com/css?family=Dosis:400,500,600,700%7COpen+Sans:400,600,700'
            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        // param 1
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return (cacheName.startsWith('witter-') && cacheName !== staticCacheName);
                }).map(function (cacheName) {
                    return cache.delete(cacheName);
                })
            );

        })
    );
});

self.addEventListener('fetch', function (event) {
    console.log("jha - event = ");
    console.log(event);

    //-- event.respondWith() functions:
    let text = function () {
        return fetch(event.request).then(function (response) {
            if (response.status === 404) {
                // respond with gif
                return new Response("jha - that page does not exist");
            }
            return response;
        }).catch(function () {
            return new Response("jha - We're in offline mode ...");
        })
    };
    let replacingJpgs = function () {
        if (event.request.url.endsWith('.jpg')) event.respondWith(fetch('/imgs/dr-evil.gif'));
    };
    let gifs = function () {
        return fetch(event.request)
            .then(function (response) {
                if (response.status === 404) return fetch('/imgs/dr-evil.gif');
                return response;
            })
            .catch(function () {
                return new Response("jha - We're in offline mode");
            });
    };
    let myCache = function () {
        return caches.match(event.request).then(function (response) {
            if (response) return response;

            // sort of a magic line of code that'll return the cache if offline.
            return fetch(event.request);
        });
    };

    event.respondWith(
        // param 1
        myCache()
    );
});