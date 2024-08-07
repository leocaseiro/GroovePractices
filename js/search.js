import { getAll, initDB, isDBInitialized } from './db.js';
import { renderGrooves, renderPagination } from './ui.js';
import { currentSort, currentPage, currentItemsPerPage, filteredGrooves, setFilteredGrooves, setCurrentPage } from './shared.js';

function applyFilters(page = 1) {
    if (!isDBInitialized()) {
        console.error('Database is not initialized. Please wait and try again.');
        return;
    }

    setCurrentPage(page);
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const authorFilter = document.getElementById('authorFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const bookmarkedFilter = document.getElementById('bookmarkedFilter').checked;

    getAll(page).then(({ allGrooves }) => {
        // Apply filters to all grooves
        const newFilteredGrooves = allGrooves.filter(groove =>
            (groove.name.toLowerCase().includes(searchTerm) || groove.author.toLowerCase().includes(searchTerm)) &&
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
    }).catch(error => {
        console.error('Error applying filters:', error);
    });
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
    getAll(currentPage, currentItemsPerPage).then(({ grooves }) => {
        const authors = [...new Set(grooves.map(groove => groove.author))];
        authors.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        const select = document.getElementById('authorFilter');
        select.innerHTML = '<option value="">All Authors</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            select.appendChild(option);
        });
    }).catch(error => {
        console.error('Error populating author filter:', error);
    });
}

function goToFirstPage() {
    applyFilters(1);
}

// Event listeners
initDB().then(() => {
    document.getElementById('search').addEventListener('input', goToFirstPage);
    document.getElementById('authorFilter').addEventListener('change', goToFirstPage);
    document.getElementById('difficultyFilter').addEventListener('change', goToFirstPage);
    document.getElementById('bookmarkedFilter').addEventListener('change', goToFirstPage);
});

export { applyFilters, handleFilterPagination, populateAuthorFilter };
