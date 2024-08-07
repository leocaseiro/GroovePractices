import { deleteGroove, editGroove, showGrooveForm } from './grooveForm.js';
import { showPracticeForm } from './practiceForm.js';
import { get, getAll, remove, update } from './db.js';

let currentSort = { column: 'name', direction: 'asc' };

function renderGrooves(grooves) {
    const tbody = document.querySelector('#grooveList tbody');
    tbody.innerHTML = '';

    // Sort the grooves based on the current sort settings
    grooves.sort((a, b) => {
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

    grooves.forEach(groove => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><button class="bookmark-star ${groove.bookmark ? 'bookmarked' : 'not-bookmarked'}" data-id="${groove.id}">${groove.bookmark ? '⭐️' : '⭐️'}</button></td>
            <td><a target="_blank" rel="nofollow noopener noreferrer" href="${groove.value}">${groove.name}</a></td>
            <td>${groove.author}</td>
            <td>${groove.difficulty}</td>
            <td>${groove.bpm}</td>
            <td>${renderLastPractice(groove.practices)}</td>
             <td>
                <button class="edit" data-id="${groove.id}">✏️</button>
                <button class="delete" data-id="${groove.id}">🗑️</button>
                <button class="add-practice" data-id="${groove.id}">+ Practice</button>
            </td>
        `;
    });

    // Update sort indicators
    updateSortIndicators();
}

function updateSortIndicators() {
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

function renderLastPractice(practices) {
    if (practices && practices.length > 0) {
        const lastPractice = practices[practices.length - 1];
        const date = new Date(lastPractice.datetime).toLocaleDateString();
        return `${date} - Score: ${lastPractice.score}`;
    }
    return 'No practices';
}

function toggleBookmark(id) {
    get(id).then(groove => {
        groove.bookmark = !groove.bookmark;
        return update(groove);
    }).then(() => {
        loadGrooves();
    }).catch(error => {
        console.error('Error toggling bookmark:', error);
    });
}

function handleSort(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    loadGrooves();
}

function loadGrooves() {
    getAll().then(grooves => {
        renderGrooves(grooves);
    }).catch(error => {
        console.error('Error loading grooves:', error);
    });
}

// Event listeners
document.getElementById('grooveList').addEventListener('click', (e) => {
    if (e.target.classList.contains('bookmark-star')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        toggleBookmark(id);
    } else if (e.target.classList.contains('edit')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        editGroove(id);
    } else if (e.target.classList.contains('delete')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        deleteGroove(id);
    } else if (e.target.classList.contains('add-practice')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        showPracticeForm(id);
    }
});

document.querySelector('#grooveList thead').addEventListener('click', (e) => {
    const th = e.target.closest('th');
    if (th && th.classList.contains('sortable')) {
        const column = th.getAttribute('data-sort');
        handleSort(column);
    }
});

export { renderGrooves, loadGrooves };
