import { initDB } from './db.js';
import { loadGrooves } from './ui.js';
import { populateAuthorFilter } from './search.js';
// import { populateTestData } from './testData.js';

document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        loadGrooves();
        populateAuthorFilter();
        // populateTestData(50); // This will add 50 test grooves if the database is empty

    }).catch(error => {
        console.error('Error initializing app:', error);
    });
});
