import { deleteGroove, editGroove, showGrooveForm } from './grooveForm.js';
import { showPracticeForm } from './practiceForm.js';
import { get, getAll, remove, update } from './db.js';
import { currentItemsPerPage, currentPage, currentSort, escapeHTML, setCurrentPage, setCurrentSort, updateSortIndicators } from './shared.js';
import { applyFilters, changePage, goToFirstPage } from './search.js';
import { updateURL } from './browserHistory.js';

function openPlayerModal(id) {
    get(parseInt(id)).then((groove) => {
        const { name, url } = groove;
        const iFrame = document.createElement('iframe');
        iFrame.src = url;

        const modalEl = document.getElementById('player-modal');
        const nameEl = document.getElementById('player-modal__name');
        const contentEl = document.getElementById('player-modal__content');
        const grooveIdHiddenInput = document.getElementById('js-grooveId');

        // Clear previous content
        nameEl.innerHTML = '';
        contentEl.innerHTML = '';

        nameEl.innerHTML = name;
        contentEl.appendChild(iFrame);
        grooveIdHiddenInput.value = id;
        modalEl.showModal();
    });
}

function renderGrooves(grooves, totalItems, currentPage, totalPages) {
    const tbody = document.querySelector('#grooveList tbody');
    tbody.innerHTML = '';

    grooves.forEach(groove => {
        const row = tbody.insertRow();

        // Create and append cells
        const bookmarkCell = row.insertCell();
        const bookmarkButton = document.createElement('button');
        bookmarkButton.setAttribute('data-tooltip', groove.bookmark ? 'remove bookmark' : 'bookmark groove');
        bookmarkButton.className = `bookmark-star ${groove.bookmark ? 'bookmarked' : 'not-bookmarked'}`;
        bookmarkButton.setAttribute('data-id', groove.id);
        bookmarkButton.textContent = '⭐️';
        bookmarkCell.appendChild(bookmarkButton);

        const nameCell = row.insertCell();
        const nameLink = document.createElement('a');
        nameLink.href = '#';
        nameLink.setAttribute('data-player-id', groove.id);
        nameLink.textContent = groove.name;
        nameCell.appendChild(nameLink);

        const authorCell = row.insertCell();
        authorCell.textContent = groove.author;

        const difficultyCell = row.insertCell();
        difficultyCell.textContent = groove.difficulty;

        const bpmCell = row.insertCell();
        bpmCell.textContent = groove.bpm;

        const tagsCell = row.insertCell();
        tagsCell.innerHTML = groove.tags.map(tag => escapeHTML(tag)).join(', ');

        const practiceCell = row.insertCell();
        practiceCell.innerHTML = renderLastPractice(groove.practices);

        const actionsCell = row.insertCell();
        const actionsDiv = document.createElement('div');
        ['Edit Groove', 'Remove Groove', 'Add Practice'].forEach((tooltip, index) => {
            const button = document.createElement('button');
            button.setAttribute('data-tooltip', tooltip);
            button.className = ['edit', 'delete', 'add-practice'][index];
            button.setAttribute('data-id', groove.id);
            button.textContent = ['✏️', '🗑️', '▶︎'][index];
            actionsDiv.appendChild(button);
            actionsDiv.classList.add('td-actions');
        });
        actionsCell.appendChild(actionsDiv);

        // Add event listener for opening the player modal
        nameLink.addEventListener('click', () => {
            const playerId = nameLink.getAttribute('data-player-id');
            openPlayerModal(playerId);
        });
    });

    // Update sort indicators
    updateSortIndicators();

    // Render pagination controls
    renderPagination(totalItems, currentPage, totalPages);
}

function renderPagination(totalItems, currentPage, totalPages) {
    currentPage = parseInt(currentPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = createButton({ text: 'prev', disabled: currentPage <= 1, onClick: () => {
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    }});

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
        paginationContainer.appendChild(createButton({ text: '1', disabled: false, onClick: () => changePage(1) }));

        if (startPage > 2) {
            paginationContainer.appendChild(createButton({ text: '...', disabled: true }));
        }
    }
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createButton({ text: i.toString(), disabled: false, onClick: () => changePage(i), isCurrent: i === currentPage }));
    }

    // Last page button (if not in range)
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationContainer.appendChild(createButton({ text: '...', disabled: true }));
        }
        paginationContainer.appendChild(createButton({ text: totalPages.toString(), disabled: false, onClick: () => changePage(totalPages) }));
    }

    // Next button
    const nextButton = createButton({ text: 'next', disabled: currentPage >= totalPages, onClick: () => {
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    }});
    paginationContainer.appendChild(nextButton);
}

function createButton({ text, disabled, onClick, isCurrent = false }) {
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

function modalListeners() {
    document.querySelectorAll('[data-close-modal]').forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.getElementById(button.dataset.closeModal);
            if (!modal) return;
            modal.close();
        });
    });
}


export { modalListeners, paginationListeners, renderGrooves, renderPagination };
