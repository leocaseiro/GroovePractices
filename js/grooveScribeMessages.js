import { get, update } from './db.js';

const saveGrooveScribeViaPostMessage = (e) => {
    if (e.data?.message !== 'saveGrooveScribe') {
        return;
    }

    const grooveIdHiddenInput = document.getElementById('js-grooveId');
    const grooveId = parseInt(grooveIdHiddenInput.value);

    if (!grooveId) {
        return;
    }

    get(grooveId).then(existingGroove => {
        const groove = {
            ...existingGroove,
            url: e.data.url,
        };
        return update(groove);
    }).then(() => {
        alert('Groove URL updated!');
    }).catch(error => {
        console.error('Error saving groove:', error);
    });
}

export const grooveScribeMessagesListeners = () => {
    window.addEventListener('message', saveGrooveScribeViaPostMessage);
};
