import idb from 'idb';

let dbPromise = idb.open('jtest-db', 1, function (upgradeDb) {
    let keyValStore = upgradeDb.createObjectStore('jkeyval');
    keyValStore.put('earth', 'ello');
});

dbPromise.then(function (db) {
    let tx = db.transaction('jkeyval');
    let keyValStore = tx.objectStore('jkeyval');
    return keyValStore.get('ello');
}).then(function (val) {
    console.log('jha - zValue of "ello" = ', val);
});

dbPromise.then(function(db){
    let tx = db.transaction('jkeyval', 'readwrite');
    let keyValueStore = tx.objectStore('jkeyval');
    keyValueStore.put('Julius', 'name');
    return tx.complete; 
}).then(function(){
    console.log('Added to jkeyval objectStore');
});