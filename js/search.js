import { getAll } from './db.js';
import { renderGrooves } from './ui.js';

function applyFilters() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const authorFilter = document.getElementById('authorFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const bookmarkedFilter = document.getElementById('bookmarkedFilter').checked;

    getAll().then(grooves => {
        grooves = grooves.filter(groove =>
            (groove.name.toLowerCase().includes(searchTerm) || groove.author.toLowerCase().includes(searchTerm)) &&
            (authorFilter === '' || groove.author === authorFilter) &&
            (difficultyFilter === '' || groove.difficulty.toString() === difficultyFilter) &&
            (!bookmarkedFilter || groove.bookmark)
        );
        renderGrooves(grooves);
    }).catch(error => {
        console.error('Error applying filters:', error);
    });
}

function populateAuthorFilter() {
    getAll().then(grooves => {
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

// Event listeners
document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('authorFilter').addEventListener('change', applyFilters);
document.getElementById('difficultyFilter').addEventListener('change', applyFilters);
document.getElementById('bookmarkedFilter').addEventListener('change', applyFilters);

export { applyFilters, populateAuthorFilter };
