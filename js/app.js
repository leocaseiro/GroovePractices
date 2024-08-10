import { initDB } from './db.js';
import { applyFilters, initializeSearch, populateAuthorFilter } from './search.js';
// import { populateTestData } from './testData.js';

document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        initializeSearch();
        applyFilters();
        populateAuthorFilter();
        // populateTestData(4050, 5000); // This will add 50 test grooves if the database is empty

    }).catch(error => {
        console.error('Error initializing app:', error);
    });
});
