import { currentPage, currentItemsPerPage, setCurrentPage } from './shared.js';

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

function isDBInitialized() {
    return !!db;
}

function getAll(page = currentPage, itemsPerPage = currentItemsPerPage) {
    return new Promise((resolve, reject) => {

        if (!isDBInitialized()) {
            reject(new Error("Database is not initialized"));
            return;
        }

        const transaction = db.transaction(['grooves'], 'readonly');
        const objectStore = transaction.objectStore('grooves');
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            const allGrooves = event.target.result;
            const totalItems = allGrooves.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedGrooves = allGrooves.slice(startIndex, endIndex);

            resolve({
                allGrooves: allGrooves,
                grooves: paginatedGrooves,
                totalItems: totalItems,
                currentPage: page,
                totalPages: totalPages
            });
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

export { initDB, isDBInitialized, getAll, add, update, get, remove };
