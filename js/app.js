import { initDB } from './db.js';
import { currentPage } from './shared.js';
import { modalListeners, paginationListeners } from './ui.js';
import { updateFieldsFromURL } from './browserHistory.js';
import { grooveFormListeners } from './grooveForm.js';
import { practiceFormListeners } from './practiceForm.js';
import { grooveScribeMessagesListeners } from './grooveScribeMessages.js';
import { applyFilters, initializeSearch, populateAuthorFilter } from './search.js';
import { searchTagify, initializeTagify, updateTagWhitelist, getFormTags, getSearchTags, addTagListeners } from './tags.js';

// import { populateTestData } from './testData.js';

document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        initializeTagify();
        populateAuthorFilter();
        updateFieldsFromURL(false);
        initializeSearch(currentPage);
        addTagListeners();

        grooveFormListeners();
        modalListeners();
        paginationListeners();
        practiceFormListeners();
        grooveScribeMessagesListeners();
        // populateTestData(1, 1); // This will add 50 test grooves if the database is empty

        // Add event listeners for when URL is changed
        window.onpopstate = function(event) {
            updateFieldsFromURL(true);
        }
    }).catch(error => {
        console.error('Error initializing app:', error);
    });
});
