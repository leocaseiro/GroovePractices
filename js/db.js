let db;
const dbName = 'GroovePracticesDB';
const dbVersion = 1;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            const objectStore = db.createObjectStore('grooves', { keyPath: 'id', autoIncrement: true });
            objectStore.createIndex('name', 'name', { unique: false });
            objectStore.createIndex('author', 'author', { unique: false });
        };
    });
}

function getAll() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['grooves'], 'readonly');
        const objectStore = transaction.objectStore('grooves');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function add(groove) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['grooves'], 'readwrite');
        const objectStore = transaction.objectStore('grooves');
        const request = objectStore.add(groove);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function update(groove) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['grooves'], 'readwrite');
        const objectStore = transaction.objectStore('grooves');
        const request = objectStore.put(groove);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function get(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['grooves'], 'readonly');
        const objectStore = transaction.objectStore('grooves');
        const request = objectStore.get(id);

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function remove(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['grooves'], 'readwrite');
        const objectStore = transaction.objectStore('grooves');
        const request = objectStore.delete(id);

        request.onsuccess = (event) => {
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

export { initDB, getAll, add, update, get, remove };
