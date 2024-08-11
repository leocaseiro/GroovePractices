import { searchTagify } from './tags.js';
import { currentPage, currentSort, setCurrentAuthor, setCurrentPage, setCurrentSort } from './shared.js';
import { update } from './db.js';
import { applyFilters } from './search.js';

function updateURL() {
    const searchTerm = document.getElementById('search').value;
    const tagSearchTerms = searchTagify.value.map(tag => tag.value);
    const authorFilter = document.getElementById('authorFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const bookmarkedFilter = document.getElementById('bookmarkedFilter').checked;

    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (tagSearchTerms.length > 0) params.set('tags', tagSearchTerms.join(','));
    if (authorFilter) params.set('author', authorFilter);
    if (difficultyFilter) params.set('difficulty', difficultyFilter);
    if (bookmarkedFilter) params.set('bookmarked', 'true');

    params.set('page', currentPage.toString());
    params.set('sort', currentSort.column);
    params.set('direction', currentSort.direction);
    const newURL = `${window.location.pathname}?${params.toString()}`;
    history.pushState({ page: currentPage, sort: currentSort }, '', newURL);
}

function updateFieldsFromURL(applyingFilters = true) {
    debugger;
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search') || '';
    const tags = params.get('tags') || '';
    const author = params.get('author') || '';
    const difficulty = params.get('difficulty') || '';
    const bookmarked = params.get('bookmarked') || '';
    const page = params.get('page') || 1;
    const sort = params.get('sort') || 'difficulty';
    const direction = params.get('direction') || 'asc';

    document.getElementById('search').value = search;
    searchTagify.addTags(tags.split(',').map(tag => ({ value: tag, searchBy: 'value' })));
    document.getElementById('authorFilter').value = author;
    document.getElementById('difficultyFilter').value = difficulty;
    document.getElementById('bookmarkedFilter').checked = bookmarked;
    setCurrentAuthor(author);
    setCurrentPage(page);
    setCurrentSort({ column: sort, direction: direction });

    if (applyingFilters) {
        applyFilters(page, false);
    }
}

export { updateURL, updateFieldsFromURL };
