let staticCacheName = 'wittr-static-v12';
// change 1 2 3 4 5
self.addEventListener('install', function (event) {
    const urlsToCache = [
        '/',
        'js/main.js',
        'css/main.css',
        'imgs/icon.png',
        'https://fonts.googleapis.com/css?family=Dosis:400,500,600,700%7COpen+Sans:400,600,700'
    ];

    event.waitUntil(
        // start param 1
        caches.open(staticCacheName).then(function (cache) {
            // addAll() returns a promise
            return cache.addAll([
                '/',
                'js/main.js',
                'css/main.css',
                'imgs/icon.png',
                'https://fonts.googleapis.com/css?family=Dosis:400,500,600,700%7COpen+Sans:400,600,700'
            ]);
        }) // end param 1
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        // start param 1
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return (cacheName.startsWith('wittr-') &&
                        cacheName !== staticCacheName);
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        }) // end param 1
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

/* listen for 'message' event and call .skipWaiting() if I
 * get the correct message */
self.addEventListener('message', function(event){
    // event.data is from worker.postMessage()
    if(event.data.action === 'skipWaiting') {
        // make this ser.wor take over pages
        self.skipWaiting();
    }
});