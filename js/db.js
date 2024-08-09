import { currentPage, currentItemsPerPage, setCurrentPage } from './shared.js';

let db;
const dbName = 'GroovePracticesDB';
const STORE_NAME = 'grooves';
const dbVersion = 2;

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
            const db = event.target.result;
            const transaction = event.target.transaction;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                // If the object store doesn't exist, create it
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                // Create indexes for fields we are mostly searching by
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('author', 'author', { unique: false });
                store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                store.createIndex('bpm', 'bpm', { unique: false });
                store.createIndex('difficulty', 'difficulty', { unique: false });
            } else {
                // update its schema
                const store = transaction.objectStore(STORE_NAME);

                if (!store.indexNames.contains('tags')) {
                    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                }
                if (!store.indexNames.contains('bpm')) {
                    store.createIndex('bpm', 'bpm', { unique: false });
                }
                if (!store.indexNames.contains('difficulty')) {
                    store.createIndex('difficulty', 'difficulty', { unique: false });
                }
            }

            // If we're upgrading from version 1 to 2, add tags to existing records
            if (event.oldVersion < 2) {
                const store = transaction.objectStore(STORE_NAME);
                store.openCursor().onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const updateData = cursor.value;
                        if (!updateData.tags) {
                            updateData.tags = [];
                            cursor.update(updateData);
                        }
                        cursor.continue();
                    }
                };
            }
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
