import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';

function openDatabase() {
    // if the browser doesn't have a ser.wor, we don't need a db.
    if(!navigator.serviceWorker) return Promise.resolve();

    // return a promise for a db called wittr that contains 1 objectStore `wittrs`
    // and uses id as its' key and has an idx `by-date`, which is sorted by the time

}

export default function IndexController(container) {
    this._container = container;
    this._postsView = new PostsView(this._container);
    this._toastsView = new ToastsView(this._container);
    this._lostConnectionToast = null;
    this._openSocket();
    this._openDatabase = openDatabase();
    this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function () {
    const indexController = this;

    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.register('/sw.js').then(function (reg) {
        /**
         *  reg = registerObject... I think.
        **/

        /* If there's no ctrl, page wasn't loaded via a ser.wor, so user is
         * looking at latest version. In this case exit early. */
        if (!navigator.serviceWorker.controller) return;

        /* if there's an updated worker already waiting,
         * call IndexController._updateReady() */
        if (reg.waiting) {
            indexController._updateReady(reg.waiting);
            return;
        }

        /* if there's an updated worker installing, track its' progress. Once it
         * installs call indexController._updateReady() */
        if (reg.installing) {
            indexController._trackInstalling(reg.installing);
            return;
        }

        /* Otherwise, listen for new installing workers arriving.
         * If one arrives, track its' progress.
         * If it becomes installed, call indexController._updateReady() */
        reg.addEventListener('updatefound', function () {
            indexController._trackInstalling(reg.installing);
        });
    });

    // Ensure refresh is only called once.
    // This works around a bug in "force update on reload".
    /* listen for the controlling service working changing and reload the page */
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if(refreshing) return;
        window.location.reload();
        refreshing = true;
    })
};

IndexController.prototype._updateReady = function (worker) {
    let toast = this._toastsView.show("jha - There is a newer version!",
        {buttons: ['refresh', 'dismiss']}
    );

    toast.answer.then(function (answer) {
        if (answer !== 'refresh') return;

        /* tell the ser.wor to skip waiting */
        worker.postMessage({action: 'skipWaiting'});
    });
};

IndexController.prototype._trackInstalling = function (worker) {
    let indexController = this;

    worker.addEventListener('statechange', function () {
        if (worker.state === 'installed') {
            indexController._updateReady(worker);
        }
    });
};

// open a connection to the server for live updates
IndexController.prototype._openSocket = function () {
    var indexController = this;
    var latestPostDate = this._postsView.getLatestPostDate();

    // create a url pointing to /updates with the web socket protocol
    var socketUrl = new URL('/updates', window.location);
    socketUrl.protocol = 'ws';

    if (latestPostDate) {
        socketUrl.search = 'since=' + latestPostDate.valueOf();
    }

    // this is a little hack for the settings page's tests,
    // it isn't needed for Wittr
    socketUrl.search += '&' + location.search.slice(1);

    var ws = new WebSocket(socketUrl.href);

    // add listeners
    ws.addEventListener('open', function () {
        if (indexController._lostConnectionToast) {
            indexController._lostConnectionToast.hide();
        }
    });

    ws.addEventListener('message', function (event) {
        requestAnimationFrame(function () {
            indexController._onSocketMessage(event.data);
        });
    });

    ws.addEventListener('close', function () {
        // tell the user
        if (!indexController._lostConnectionToast) {
            indexController._lostConnectionToast = indexController._toastsView.show("Unable to connect. Retrying…");
        }

        // try and reconnect in 5 seconds
        setTimeout(function () {
            indexController._openSocket();
        }, 5000);
    });
};

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function (data) {
    var messages = JSON.parse(data);
    console.log("jha - messages:");
    console.log(messages);
    this._postsView.addPosts(messages);
};