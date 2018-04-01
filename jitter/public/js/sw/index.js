self.addEventListener('fetch', function (event) {

    console.log("jha - event = ");
    console.log(event);

    // catch 404's and offline
    event.respondWith(
        // param 1
        fetch(event.request).then(function(response){
            if(response.status === 404) {
                return new Response("jha - That page doesn't exist");
            }
            return response;
        }).catch(function(){
            return new Response("jha - We're in offline mode ...");
        })
    );

    // if (event.request.url.endsWith('.jpg')) event.respondWith(fetch('/imgs/dr-evil.gif'));
});