import * as expensesApp from './App.js';

import state from './state.js';

const FAB_NEW_BUTTON = 'fab-new-button';

function getNewButton() {
    return document.getElementById(FAB_NEW_BUTTON);
}

function render() {
    if (!expensesApp.isNewButtonVisible() || !!state.form) {
        return '';
    }
    return `
        <div class="position-fixed pb-2 px-2 bottom-0 d-sm-none">
            <button type="button" id="${FAB_NEW_BUTTON}" class="btn btn-primary w-100">
                <i class="bi-plus-square"></i>
                Ausgabe hinzufügen
            </button>
        </div>`;
}

function onAttach() {
    getNewButton()?.addEventListener('click', expensesApp.startNew);
}

export {
    onAttach,
    render
};
