import * as expensesApp from './App.js';

import state from './state.js';
import t from './texts.js';

const FAB_NEW_BUTTON = 'fab-new-button';

function getNewButton() {
    return document.getElementById(FAB_NEW_BUTTON);
}

function render() {
    if (!expensesApp.isNewButtonVisible() || !!state.form) {
        return '';
    }
    return `
        <div class="position-fixed pb-2 px-2 bottom-0 d-sm-none d-flex justify-content-end">
            <button type="button" id="${FAB_NEW_BUTTON}" class="btn btn-primary">
                <i class="bi-plus-square"></i>
                ${t('New')}
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
