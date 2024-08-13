import { get, getAll, update } from './db.js';
import { applyFilters, populateAuthorFilter } from './search.js';
import { updateTagWhitelist } from './tags.js';

function savePlayerGroove() {
    debugger;
    const playerModalContentEl = document.getElementById('js-player-modal__content');
    const saveIframeBtn = document.getElementById('js-save-iframe');
    const save = document.getElementById('js-player-modal__content');

    const grooveId = parseInt(saveIframeBtn.dataset.grooveId);
    const iframe = playerModalContentEl.getElementsByTagName('iframe')[0];
    const value = iframe.contentWindow.location.href; // CORS ISSUES
    let groove = {};

    if (grooveId) {
        get(grooveId).then(existingGroove => {
            groove = {...existingGroove, value};
            return update(groove);
        }).then(() => {
            applyFilters();
            populateAuthorFilter();

            getAll(1).then(({ allGrooves }) => {
                updateTagWhitelist(allGrooves);
            });
        }).catch(error => {
            console.error('Error saving groove:', error);
        });
    }
}

const playerModalListeners = () => {
    document.getElementById('playerModalForm').addEventListener('submit', (e) => {
        e.preventDefault();
        savePlayerGroove();
    });
};

export { playerModalListeners };
