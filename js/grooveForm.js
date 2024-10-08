import { get, getAll, add, update, remove } from './db.js';
import { applyFilters, populateAuthorFilter } from './search.js';
import { scrollToDiv } from './shared.js';
import { getFormTags, updateTagWhitelist } from './tags.js';

function showGrooveForm(groove = null) {
    const form = document.getElementById('grooveForm');
    const formTitle = document.getElementById('formTitle');
    const practicesList = document.getElementById('practicesList');

    if (groove) {
        formTitle.textContent = 'Edit Groove';
        form.grooveId.value = groove.id;
        form.name.value = groove.name;
        form.author.value = groove.author;
        form.difficulty.value = groove.difficulty;
        form.url.value = groove.url;
        form.bpm.value = groove.bpm;
        form.formTags.value = groove.tags ? groove.tags.join(', ') : '';

        if (groove.practices && groove.practices.length > 0) {
            renderPractices(groove.practices);
            practicesList.style.display = 'block';
        } else {
            practicesList.style.display = 'none';
        }
    } else {
        formTitle.textContent = 'Add New Groove';
        form.reset();
        form.grooveId.value = '';
        form.formTags.value = '';
        practicesList.style.display = 'none';
    }

    document.getElementById('formContainer').style.display = 'block';
    scrollToDiv('formContainer');
}

function hideGrooveForm() {
    document.getElementById('formContainer').style.display = 'none';
}

function renderPractices(practices) {
    const tbody = document.querySelector('#practicesTable tbody');
    tbody.innerHTML = '';
    practices.forEach((practice) => {
        const row = tbody.insertRow();
        const date = new Date(practice.datetime).toLocaleString();
        row.innerHTML = `
            <td>${date}</td>
            <td>${practice.bpm}</td>
            <td>${practice.score}</td>
            <td>${practice.loops ?? 1}</td>
        `;
    });
}

function isUrlValid(url) {
    const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const regex = new RegExp(expression);

    return url.match(regex);
}

function saveGroove() {
    const form = document.getElementById('grooveForm');
    const groove = {
        name: form.name.value,
        author: form.author.value,
        difficulty: parseInt(form.difficulty.value),
        url: form.url.value,
        bpm: parseInt(form.bpm.value),
        practices: [],
        tags: getFormTags()
    };

    if (!isUrlValid(groove.url)) {
        alert('Invalid URL. Please enter a valid URL.');
        return;
    }

    if (form.grooveId.value) {
        groove.id = parseInt(form.grooveId.value);
        get(groove.id).then(existingGroove => {
            groove.practices = existingGroove.practices || [];
            return update(groove);
        }).then(() => {
            hideGrooveForm();
            applyFilters();
            populateAuthorFilter();
        }).catch(error => {
            console.error('Error saving groove:', error);
        });
    } else {
        add(groove).then(() => {
            hideGrooveForm();
            applyFilters();
            populateAuthorFilter();
        }).catch(error => {
            console.error('Error saving groove:', error);
        });
    }

    getAll(1).then(({ allGrooves }) => {
        updateTagWhitelist(allGrooves);
    });
}

function editGroove(id) {
    get(id).then(groove => {
        showGrooveForm(groove);
    }).catch(error => {
        console.error('Error editing groove:', error);
    });
}

function deleteGroove(id) {
    if (confirm('Are you sure you want to delete this groove?')) {
        remove(id).then(() => {
            applyFilters();
            populateAuthorFilter();
        }).catch(error => {
            console.error('Error deleting groove:', error);
        });
    }
}

// Event listeners
const grooveFormListeners = () => {
    document.getElementById('addGroove').addEventListener('click', () => showGrooveForm());
    document.getElementById('grooveForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveGroove();
    });
    document.getElementById('cancelForm').addEventListener('click', () => hideGrooveForm());
}

export { deleteGroove, editGroove, grooveFormListeners, showGrooveForm }
