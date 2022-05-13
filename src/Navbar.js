import * as UnsyncedDocuments from './UnsyncedDocuments.js';
import * as constants from './constants.js';
import * as dates from './dates.js';
import * as expensesApp from './App.js';

import state from './state.js';

const MANAGE_TAGS_BUTTON = 'manage-tags-button';
const MONTH_DISPLAY_BUTTON = 'month-display-button';
const NEXT_MONTH_BUTTON = 'next-month-button';
const PREVIOUS_MONTH_BUTTON = 'previous-month-button';
const SYNC_BUTTON = 'sync-button';
const TODAY_BUTTON = 'today-button';

function getPreviousMonthButton() {
    return document.getElementById(PREVIOUS_MONTH_BUTTON);
}

function getNextMonthButton() {
    return document.getElementById(NEXT_MONTH_BUTTON);
}

function getManageTagsButton() {
    return document.getElementById(MANAGE_TAGS_BUTTON);
}

function getMonthDisplayButton() {
    return document.getElementById(MONTH_DISPLAY_BUTTON);
}

function getNewButton() {
    return document.getElementById('new-button');
}

function getTodayButton() {
    return document.getElementById(TODAY_BUTTON);
}

function renderLinkButton(id, icon, title) {
    return `
        <button type="button" id="${id}" class="btn text-light" ${title ? `title="${title}"` : ''}>
            <i class="${icon}"></i>
        </button>`;
}

function renderBrandContent() {
    if (state.viewMode === 'monthDisplay') {
        return `
            ${renderLinkButton(MANAGE_TAGS_BUTTON, 'bi-tags-fill', 'Tags bearbeiten')}
            ${renderLinkButton(PREVIOUS_MONTH_BUTTON, 'bi-chevron-left')}
            ${renderLinkButton(NEXT_MONTH_BUTTON, 'bi-chevron-right')}
            ${constants.monthFormat.format(state.date)}`
    }
    if (state.viewMode === 'manageTags') {
        return `
            ${renderLinkButton(MONTH_DISPLAY_BUTTON, 'bi-arrow-left')}
            Markierungen verwalten`;
    }
}

function renderTodayButton() {
    if (dates.isSameDay(constants.today, state.date)) {
        return '';
    }
    return renderLinkButton(TODAY_BUTTON, 'bi-calendar-date-fill');
}

function renderSyncButton(margin) {
    const unsyncedDocumentsCount = UnsyncedDocuments.count();
    if (unsyncedDocumentsCount === 0) {
        return '';
    }

    return `
        <button type="button" id="${SYNC_BUTTON}" class="btn text-light position-relative ${margin ? margin : ''}">
            <i class="bi-arrow-repeat"></i>
            <span class="position-absolute top-0 end-0 badge rounded-pill bg-danger" style="--bs-bg-opacity: .8;">
                ${unsyncedDocumentsCount}
            </span>
        </button>`;
}

function renderNewButton() {
    if (!expensesApp.isNewButtonVisible()) {
        return '';
    }
    return `
        <button id="new-button" class="btn btn-light d-none d-sm-inline-block" type="button" title="Neu">
            <i class="bi-plus-square"></i><span class="d-none d-sm-inline-block">&nbsp;Neu</span>
        </button>`;
}

function render() {
    const inManageTags = state.viewMode === 'manageTags';
    return `
        <div class="container">
            <div class="navbar-brand">
                ${renderBrandContent()}
            </div>
            <form class="d-flex">
                ${!inManageTags ? renderTodayButton() : ''}
                ${renderSyncButton(!inManageTags ? 'me-3' : '')}
                ${!inManageTags ? renderNewButton() : ''}
            </form>
        </div>`;
}

function onAttach() {
    if (state.viewMode === 'monthDisplay') {
        getPreviousMonthButton().addEventListener('click', () => expensesApp.setDate(dates.decrementMonth(state.date)));
        getNextMonthButton().addEventListener('click', () => expensesApp.setDate(dates.incrementMonth(state.date)));
        getManageTagsButton().addEventListener('click', () => expensesApp.setViewMode('manageTags'));
    }
    if (state.viewMode === 'manageTags') {
        getMonthDisplayButton().addEventListener('click', () => expensesApp.setViewMode('monthDisplay'));
    }

    getNewButton()?.addEventListener('click', expensesApp.startNew);
    getTodayButton()?.addEventListener('click', () => expensesApp.setDate(constants.today));
}

export { render, onAttach };
