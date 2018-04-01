self.addEventListener('fetch', function (event) {

    console.log("jha - event = ");
    console.log(event);

    let respondWithText404andOffline = function () {
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

    let respondWithGif = function () {
        return fetch(event.request)
            .then(function(response){
                if(response.status === 404) return fetch('/imgs/dr-evil.gif');
                return response;
            })
            .catch(function () {
                return new Response("jha - We're in offline mode");
            });
    };

    // catch 404's and offline
    event.respondWith(
        // param 1
        respondWithGif()
    );

    // if (event.request.url.endsWith('.jpg')) event.respondWith(fetch('/imgs/dr-evil.gif'));
});