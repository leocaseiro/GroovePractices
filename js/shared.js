// shared.js
export let currentAuthor = '';
export let currentPage = 1;
export const currentItemsPerPage = 10;
export let filteredGrooves = [];
export let currentSort = { column: 'difficulty', direction: 'asc' };
export function setCurrentPage(page) {
    currentPage = Number(page);
}
export function setFilteredGrooves(newFilteredGrooves) {
    filteredGrooves = newFilteredGrooves;
}
export function setCurrentSort(newCurrentSort) {
    currentSort = newCurrentSort;
    updateSortIndicators();
}
export function setCurrentAuthor(newCurrentAuthor) {
    currentAuthor = newCurrentAuthor;
}

export function scrollToDiv(divId) {
    const element = document.getElementById(divId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

export function updateSortIndicators() {
    const headers = document.querySelectorAll('#grooveList th.sortable');
    headers.forEach(header => {
        const column = header.getAttribute('data-sort');
        if (column === currentSort.column) {
            header.textContent = `${header.textContent.replace(/[▼▲]/, '')} ${currentSort.direction === 'asc' ? '▲' : '▼'}`;
        } else {
            header.textContent = header.textContent.replace(/[▼▲]/, '');
        }
    });
}

// Helper function to escape HTML
export function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
