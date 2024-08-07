import { get, add, update, remove } from './db.js';
import { loadGrooves } from './ui.js';
import { populateAuthorFilter } from './search.js';

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
        form.value.value = groove.value;
        form.bpm.value = groove.bpm;

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
        practicesList.style.display = 'none';
    }

    document.getElementById('formContainer').style.display = 'block';
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
        `;
    });
}

function saveGroove() {
    const form = document.getElementById('grooveForm');
    const groove = {
        name: form.name.value,
        author: form.author.value,
        difficulty: parseInt(form.difficulty.value),
        value: form.value.value,
        bpm: parseInt(form.bpm.value),
        practices: []
    };

    if (form.grooveId.value) {
        groove.id = parseInt(form.grooveId.value);
        get(groove.id).then(existingGroove => {
            groove.practices = existingGroove.practices || [];
            return update(groove);
        }).then(() => {
            hideGrooveForm();
            loadGrooves();
            populateAuthorFilter();
        }).catch(error => {
            console.error('Error saving groove:', error);
        });
    } else {
        add(groove).then(() => {
            hideGrooveForm();
            loadGrooves();
            populateAuthorFilter();
        }).catch(error => {
            console.error('Error saving groove:', error);
        });
    }
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
            loadGrooves();
            populateAuthorFilter();
        }).catch(error => {
            console.error('Error deleting groove:', error);
        });
    }
}

// Event listeners
document.getElementById('addGroove').addEventListener('click', () => showGrooveForm());
document.getElementById('grooveForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveGroove();
});
document.getElementById('cancelForm').addEventListener('click', () => hideGrooveForm());

export { deleteGroove, editGroove, showGrooveForm }
