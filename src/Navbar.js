import * as App from './App.js';
import * as UnsyncedDocuments from './UnsyncedDocuments.js';
import * as ViewMode from './ViewMode.js';
import * as constants from './constants.js';
import * as dates from './dates.js';
import * as positions from './positions.js';

import state from './state.js';

const MANAGE_TAGS_BUTTON = 'manage-tags-button';
const MONTH_DISPLAY_BUTTON = 'month-display-button';
const NEXT_MONTH_BUTTON = 'next-month-button';
const PREVIOUS_MONTH_BUTTON = 'previous-month-button';
const SYNC_BUTTON = 'sync-button';
const TODAY_BUTTON = 'today-button';
const SEARCH_BUTTON = 'search-button';
const SEARCH_INPUT = 'search-input';
const NEW_BUTTON = 'new-button';

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
    return document.getElementById(NEW_BUTTON);
}

function getTodayButton() {
    return document.getElementById(TODAY_BUTTON);
}

function getSearchButton() {
    return document.getElementById(SEARCH_BUTTON);
}

function getSearchInput() {
    return document.getElementById(SEARCH_INPUT);
}

function renderLinkButton(id, icon, title) {
    return `
        <button type="button" id="${id}" class="btn text-light" ${title ? `title="${title}"` : ''}>
            <i class="${icon}"></i>
        </button>`;
}

function renderBrandContent() {
    if (state.viewMode === ViewMode.MONTH_DISPLAY) {
        return `
            ${renderLinkButton(MANAGE_TAGS_BUTTON, 'bi-tags-fill', 'Tags bearbeiten')}
            ${renderLinkButton(PREVIOUS_MONTH_BUTTON, 'bi-chevron-left')}
            ${renderLinkButton(NEXT_MONTH_BUTTON, 'bi-chevron-right')}
            ${constants.monthFormat.format(state.date)}`;
    }
    if (state.viewMode !== ViewMode.MONTH_DISPLAY) {
        let result = `${renderLinkButton(MONTH_DISPLAY_BUTTON, 'bi-arrow-left')}`;
        if(state.viewMode === ViewMode.MANAGE_TAGS) {
            result += 'Markierungen verwalten';
        }
        return result;
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
    return `
        <button id="${NEW_BUTTON}" class="btn btn-light d-none d-sm-inline-block" type="button" title="Neu">
            <i class="bi-plus-square"></i><span class="d-none d-sm-inline-block">&nbsp;Neu</span>
        </button>`;
}

function renderSearchButton() {
    return `
        <button type="button" id="${SEARCH_BUTTON}" class="btn text-light" ${state.viewMode === ViewMode.SEARCH ? 'disabled' : ''}>
            <i class="bi-search"></i>
        </button>`;
}

function renderSearchInput() {
    return `<input type="text" id="search-input" class="form-control" placeholder="Suche" value="${state.searchString}">`;
}

function render() {
    const inManageTags = state.viewMode === ViewMode.MANAGE_TAGS;
    const inSearch = state.viewMode === ViewMode.SEARCH;
    return `
        <div class="container ${inSearch ? 'd-flex' : ''}">
            <div class="navbar-brand">
                ${renderBrandContent()}
            </div>
            <form class="d-flex ${inSearch ? 'flex-grow-1' : ''}" autocomplete="off">
                ${inSearch ? renderSearchInput() : ''}
                ${state.viewMode === ViewMode.MONTH_DISPLAY ? renderTodayButton() : ''}
                ${renderSyncButton(!inManageTags ? 'me-3' : '')}
                ${!inManageTags ? renderSearchButton() : ''}
                ${App.isNewButtonVisible() ? renderNewButton() : ''}
            </form>
        </div>`;
}

function onAttach() {
    if (state.viewMode === ViewMode.MONTH_DISPLAY) {
        getPreviousMonthButton().addEventListener('click', () => App.setDate(dates.decrementMonth(state.date)));
        getNextMonthButton().addEventListener('click', () => App.setDate(dates.incrementMonth(state.date)));
        getManageTagsButton().addEventListener('click', () => App.setViewMode(ViewMode.MANAGE_TAGS));
    }
    getMonthDisplayButton()?.addEventListener('click', () => App.setViewMode(ViewMode.MONTH_DISPLAY));
    getNewButton()?.addEventListener('click', App.startNew);
    getTodayButton()?.addEventListener('click', () => App.setDate(constants.today));
    getSearchButton().addEventListener('click', () => App.setViewMode(ViewMode.SEARCH));
    getSearchInput()?.addEventListener('input', async evt => {
        state.searchString = evt.currentTarget.value;
        const searchResult = await positions.getSearchData(evt.currentTarget.value);
        state.searchData = searchResult;
        App.renderAppArea();
    });
    getSearchInput()?.focus();
}

export { render, onAttach };
