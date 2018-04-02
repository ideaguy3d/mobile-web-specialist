import idb from 'idb';

let dbPromise = idb.open('jtest-db', 6, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
        case 0:
            let keyValStore = upgradeDb.createObjectStore('jkeyval');
            keyValStore.put('earth', 'ello');
        case 1:
            upgradeDb.createObjectStore('people', {keyPath: 'name'});
        case 2:
            let peopleStore = upgradeDb.transaction.objectStore('people');
            peopleStore.createIndex('animal', 'favoriteAnimal');
        case 5:
            peopleStore = upgradeDb.transaction.objectStore('people');
            peopleStore.createIndex('age', 'age');
    }

    // create an index on the people `objectStore` named "age", ordered by `age`.
});

dbPromise.then(function (db) {
    let tx = db.transaction('jkeyval');
    let keyValStore = tx.objectStore('jkeyval');
    return keyValStore.get('ello');
}).then(function (val) {
    // console.log('jha - zValue of "ello" = ', val);
});

dbPromise
    .then(function (db) {
        let tx = db.transaction('jkeyval', 'readwrite');
        let keyValueStore = tx.objectStore('jkeyval');
        keyValueStore.put('Julius', 'name');
        return tx.complete;
    })
    .then(function () {
        console.log('Added to jkeyval objectStore');
    });

dbPromise
    .then(function (db) {
        let tx = db.transaction('jkeyval', 'readwrite');
        let keyValueStore = tx.objectStore('jkeyval');
        keyValueStore.put('Grizzly Bear', 'favoriteAnimal');
        return tx.complete;
    })
    .then(function () {
        //console.log('Added favoriteAnimal:"Grizzley Bear" to jkeyval');
    });

dbPromise
    .then(function (db) {
        let tx = db.transaction('people', 'readwrite');
        let peopleStore = tx.objectStore('people');

        peopleStore.put({
            name: 'Julius Alvarado',
            age: 29,
            gender: 'male',
            favoriteAnimal: 'pomeranian'
        });

        peopleStore.put({
            name: 'Ary Aroosh',
            age: 28,
            gender: 'male',
            favoriteAnimal: 'wolf'
        });

        peopleStore.put({
            name: 'Vince Vu',
            age: 28,
            gender: 'male',
            favoriteAnimal: 'bunny'
        });

        peopleStore.put({
            name: 'Edward Palacios',
            age: 24,
            gender: 'male',
            favoriteAnimal: 'birds'
        });

        return tx.complete;
    })
    .then(function () {
        //console.log('people added');
    });

dbPromise
    .then(function (db) {
        let tx = db.transaction('people');
        let peopleStore = tx.objectStore('people');
        let animalIndex = peopleStore.index('animal');

        return animalIndex.getAll('cat');
    })
    .then(function (people) {
        console.log('People: ', people);
    });

dbPromise
    .then(function (db) {
        let tx = db.transaction('people');
        let peopleStore = tx.objectStore('people');
        let ageIndex = peopleStore.index('age');
        return ageIndex.openCursor();
    })
    .then(function(cursor){
        if(!cursor) return;
        return cursor.advance(2); 
    })
    .then(function logPerson(cursor) {
        if(!cursor) return; // base case
        console.log("jha - Cursored at:", cursor.value.name);
        // cursor.update(newValue)
        // cursor.delete(
        return cursor.continue().then(logPerson);
    })
    .then(function(){
        console.log('FINISHED - done cursoring');
    });