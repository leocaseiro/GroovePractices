// shared.js
export let currentPage = 1;
export const currentItemsPerPage = 10;
export let filteredGrooves = [];
export let currentSort = { column: 'difficulty', direction: 'asc' };
export function setCurrentPage(page) {
    currentPage = page;
}
export function setFilteredGrooves(newFilteredGrooves) {
    filteredGrooves = newFilteredGrooves;
}
export function setCurrentSort(newCurrentSort) {
    currentSort = newCurrentSort;
}

export function scrollToDiv(divId) {
    const element = document.getElementById(divId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
