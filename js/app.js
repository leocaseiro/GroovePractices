import { initDB } from './db.js';
import { loadGrooves } from './ui.js';
import { populateAuthorFilter } from './search.js';

document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        loadGrooves();
        populateAuthorFilter();
    }).catch(error => {
        console.error('Error initializing app:', error);
    });
});
