import { get, update } from './db.js';
import { scrollToDiv } from './shared.js';
import { applyFilters } from './search.js';

function showPracticeForm(grooveId) {
    get(grooveId).then(groove => {
        document.getElementById('practiceGrooveId').value = grooveId;
        document.getElementById('practiceBpm').value = groove.bpm;
        document.getElementById('practiceFormContainer').style.display = 'block';
        scrollToDiv('practiceFormContainer');
    }).catch(error => {
        console.error('Error showing practice form:', error);
    });
}

function hidePracticeForm() {
    document.getElementById('practiceFormContainer').style.display = 'none';
    document.getElementById('practiceForm').reset();
}

function savePractice() {
    const form = document.getElementById('practiceForm');
    const grooveId = parseInt(form.grooveId.value);
    const practice = {
        bpm: parseInt(form.bpm.value),
        score: parseInt(form.score.value),
        loops: parseInt(form.loops.value),
        datetime: new Date().toISOString()
    };

    get(grooveId).then(groove => {
        if (!groove.practices) {
            groove.practices = [];
        }
        groove.practices.push(practice);
        return update(groove);
    }).then(() => {
        hidePracticeForm();
        applyFilters();
    }).catch(error => {
        console.error('Error saving practice:', error);
    });
}

// Event listeners
document.getElementById('practiceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    savePractice();
});
document.getElementById('cancelPractice').addEventListener('click', () => hidePracticeForm());

export { showPracticeForm };
