import { initDB } from './db.js';
import { currentPage } from './shared.js';
import { modalListeners, paginationListeners } from './ui.js';
import { updateFieldsFromURL } from './browserHistory.js';
import { applyFilters, initializeSearch, populateAuthorFilter } from './search.js';
import { searchTagify, initializeTagify, updateTagWhitelist, getFormTags, getSearchTags, addTagListeners } from './tags.js';
import { playerModalListeners } from './playerForm.js';
// import { populateTestData } from './testData.js';

document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        initializeTagify();
        populateAuthorFilter();
        updateFieldsFromURL(false);
        initializeSearch(currentPage);
        paginationListeners();
        modalListeners();
        playerModalListeners();
        // populateTestData(50, 500); // This will add 50 test grooves if the database is empty

        // Add event listeners for when URL is changed
        window.onpopstate = function(event) {
            updateFieldsFromURL(true);
        }
    }).catch(error => {
        console.error('Error initializing app:', error);
    });
});
