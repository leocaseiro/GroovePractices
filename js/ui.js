import { deleteGroove, editGroove, showGrooveForm } from './grooveForm.js';
import { showPracticeForm } from './practiceForm.js';
import { get, getAll, remove, update } from './db.js';
import { currentItemsPerPage, currentPage, currentSort, setCurrentPage, setCurrentSort, updateSortIndicators } from './shared.js';
import { applyFilters, changePage, goToFirstPage } from './search.js';
import { updateURL } from './browserHistory.js';


function renderGrooves(grooves, totalItems, currentPage, totalPages) {
    const tbody = document.querySelector('#grooveList tbody');
    tbody.innerHTML = '';

    grooves.forEach(groove => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td><button data-tooltip="${groove.bookmark ? 'remove bookmark' : 'bookmark groove'}" class="bookmark-star ${groove.bookmark ? 'bookmarked' : 'not-bookmarked'}" data-id="${groove.id}">${groove.bookmark ? '⭐️' : '⭐️'}</button></td>
            <td><a target="_blank" rel="nofollow noopener noreferrer" href="${groove.value}">${groove.name}</a></td>
            <td>${groove.author}</td>
            <td>${groove.difficulty}</td>
            <td>${groove.bpm}</td>
            <td>${groove.tags.join(',<br> ')}</td>
            <td>${renderLastPractice(groove.practices)}</td>
             <td>
                <button data-tooltip="Edit Groove" class="edit" data-id="${groove.id}">✏️</button>
                <button data-tooltip="Remove Groove" class="delete" data-id="${groove.id}">🗑️</button>
                <button data-tooltip="Add Practice" class="add-practice" data-id="${groove.id}">▶︎</button>
            </td>
        `;
    });

    // Update sort indicators
    updateSortIndicators();

    // Render pagination controls
    renderPagination(totalItems, currentPage, totalPages);
}

function renderPagination(totalItems, currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = createButton('prev', currentPage <= 1, () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });

    paginationContainer.appendChild(prevButton);
    let startPage, endPage;
    if (totalPages <= 6) {
        // If 6 or fewer pages, show all
        startPage = 1;
        endPage = totalPages;
    } else if (currentPage <= 3) {
        // Near the beginning
        startPage = 1;
        endPage = 5;
    } else if (currentPage >= totalPages - 2) {
        // Near the end
        startPage = totalPages - 4;
        endPage = totalPages;
    } else {
        // In the middle
        startPage = currentPage - 2;
        endPage = currentPage + 2;
    }

    // First page button (if not in range)
    if (startPage > 1) {
        paginationContainer.appendChild(createButton('1', false, () => changePage(1)));

        if (startPage > 2) {
            paginationContainer.appendChild(createButton('...', true));
        }
    }
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createButton(i.toString(), false, () => changePage(i), i === currentPage));
    }

    // Last page button (if not in range)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationContainer.appendChild(createButton('...', true));
        }
        paginationContainer.appendChild(createButton(totalPages.toString(), false, () => changePage(totalPages)));
    }

    // Next button
    const nextButton = createButton('next', currentPage >= totalPages, () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    });
    paginationContainer.appendChild(nextButton);
}

function createButton(text, disabled, onClick, isCurrent = false) {
    const button = document.createElement('button');
    button.textContent = text;
    button.disabled = disabled;
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    if (isCurrent) {
        button.classList.add('current-page');
    }
    return button;
}

function renderLastPractice(practices) {
    if (practices && practices.length > 0) {
        const lastPractice = practices[practices.length - 1];
        const date = new Date(lastPractice.datetime).toLocaleDateString('en-AU', { month: 'short', day: '2-digit' });
        return `${date} - ${lastPractice.score}`;
    }
    return 'No practices';
}

function toggleBookmark(id) {
    get(id).then(groove => {
        groove.bookmark = !groove.bookmark;
        return update(groove);
    }).then(() => {
        applyFilters();
    }).catch(error => {
        console.error('Error toggling bookmark:', error);
    });
}

function handleSort(column) {
    debugger;
    let newCurrentSort = {
        ...currentSort
    };
    if (currentSort.column === column) {
        newCurrentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        newCurrentSort = {
            column: column,
            direction: 'asc'
        }
    }
    setCurrentPage(1);
    setCurrentSort(newCurrentSort);
    updateURL();
}

function paginationListeners() {
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
};


export { paginationListeners, renderGrooves, renderPagination };
