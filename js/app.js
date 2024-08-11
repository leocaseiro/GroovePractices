import { initDB } from './db.js';
import { currentPage } from './shared.js';
import { paginationListeners } from './ui.js';
import { updateFieldsFromURL } from './browserHistory.js';
import { applyFilters, initializeSearch, populateAuthorFilter } from './search.js';
import { searchTagify, initializeTagify, updateTagWhitelist, getFormTags, getSearchTags, addTagListeners } from './tags.js';
// import { populateTestData } from './testData.js';

document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        initializeTagify();
        populateAuthorFilter();
        updateFieldsFromURL(false);
        initializeSearch(currentPage);
        paginationListeners();
        // applyFilters();
        // populateTestData(4050, 5000); // This will add 50 test grooves if the database is empty

        // Add popstate event listener
        window.addEventListener('popstate', (event) => {
            updateFieldsFromURL();
        });

    }).catch(error => {
        console.error('Error initializing app:', error);
    });
});
