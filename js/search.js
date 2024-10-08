import { updateURL } from './browserHistory.js';
import { getAll, initDB, isDBInitialized } from './db.js';
import { renderGrooves, renderPagination } from './ui.js';
import { currentAuthor, currentSort, currentPage, currentItemsPerPage, filteredGrooves, setFilteredGrooves, setCurrentPage } from './shared.js';
import { searchTagify, initializeTagify, updateTagWhitelist, getFormTags, getSearchTags, addTagListeners } from './tags.js';

function applyFilters(page = 1, reload = true) {
    if (!isDBInitialized()) {
        console.error('Database is not initialized. Please wait and try again.');
        return;
    }

    setCurrentPage(page);
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const tagSearchTerms = searchTagify.value.map(tag => tag.value.toLowerCase());
    const authorFilter = document.getElementById('authorFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const bookmarkedFilter = document.getElementById('bookmarkedFilter').checked;

    getAll(page).then(({ allGrooves }) => {
        // Apply filters to all grooves
        const newFilteredGrooves = allGrooves.filter(groove =>
            (groove.name.toLowerCase().includes(searchTerm) || groove.author.toLowerCase().includes(searchTerm)) &&
            (tagSearchTerms.length === 0 || tagSearchTerms.every(tag => groove.tags && groove.tags.some(grooveTag => grooveTag.toLowerCase().includes(tag)))) &&
            (authorFilter === '' || groove.author === authorFilter) &&
            (difficultyFilter === '' || groove.difficulty.toString() === difficultyFilter) &&
            (!bookmarkedFilter || groove.bookmark)
        );

        // Sort the grooves based on the current sort settings
        newFilteredGrooves.sort((a, b) => {
            const aValue = a[currentSort.column];
            const bValue = b[currentSort.column];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return currentSort.direction === 'asc'
                    ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
                    : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
            } else {
                return currentSort.direction === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }
        });

        setFilteredGrooves(newFilteredGrooves);

        // Calculate pagination
        const totalItems = newFilteredGrooves.length;
        const totalPages = Math.ceil(totalItems / currentItemsPerPage);
        const startIndex = (page - 1) * currentItemsPerPage;
        const endIndex = startIndex + currentItemsPerPage;
        const paginatedGrooves = newFilteredGrooves.slice(startIndex, endIndex);

        handleFilterPagination(page);

        // Update tag whitelist after filtering
        updateTagWhitelist(allGrooves);

        if (reload) {
            updateURL();
        }
    }).catch(error => {
        console.error('Error applying filters:', error);
    });
}

function changePage(page) {
    setCurrentPage(page);
    updateURL();
}

// Function to handle pagination for filtered results
function handleFilterPagination(page) {
    // Calculate pagination
    const totalItems = filteredGrooves.length;
    const startIndex = (page - 1) * currentItemsPerPage;
    const endIndex = startIndex + currentItemsPerPage;
    const paginatedGrooves = filteredGrooves.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredGrooves.length / currentItemsPerPage);
    renderGrooves(paginatedGrooves, totalItems, page, totalPages);
}

function populateAuthorFilter() {
    getAll(1, 1).then(({ allGrooves }) => {
        const authors = [...new Set(allGrooves.map(groove => groove.author))];
        authors.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const select = document.getElementById('authorFilter');
        select.innerHTML = '<option value="">- All Authors -</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            select.appendChild(option);
        });
        select.value = currentAuthor;
    }).catch(error => {
        console.error('Error populating author filter:', error);
    });
}

function goToFirstPage() {
    setCurrentPage(1);
    updateURL();
}

// Event listeners
function initializeSearch(page = 1) {
    document.getElementById('search').addEventListener('input', () => goToFirstPage());
    document.getElementById('authorFilter').addEventListener('change', () => goToFirstPage());
    document.getElementById('difficultyFilter').addEventListener('change', () => goToFirstPage());
    document.getElementById('bookmarkedFilter').addEventListener('change', () => goToFirstPage());

    // Initialize Tagify and update tag whitelist
    // initializeTagify();
    getAll().then(({ allGrooves }) => {
        updateTagWhitelist(allGrooves);
        applyFilters(page, false); // Initial application of filters
    });
    addTagListeners(() => goToFirstPage());
};

export { applyFilters, changePage, goToFirstPage, handleFilterPagination, populateAuthorFilter, initializeSearch };
