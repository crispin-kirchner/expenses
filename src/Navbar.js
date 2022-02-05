import * as constants from './constants.js';
import * as dates from './dates.js';
import * as expensesApp from './App.js';

import state from './state.js';

function renderBrandContent() {
    if (state.viewMode === 'monthDisplay') {
        const monthLabel = constants.monthFormat.format(state.date);
        return `
            <button id="manage-tags-button" class="btn text-light" title="Tags bearbeiten">
                <i class="bi-tags-fill"></i>
            </button>
            <button id="previous-month-button" class="btn text-light">
                <i class="bi-chevron-left"></i>
            </button>
            <button id="next-month-button" class="btn text-light">
                <i class="bi-chevron-right"></i>
            </button>
            ${monthLabel}`
    }
    if (state.viewMode === 'manageTags') {
        return `
            <button id="month-display-button" type="button" class="btn text-light">
                <i class="bi-arrow-left"></i>
            </button>
            Markierungen verwalten`;
    }
}

function renderTodayButton() {
    if (dates.isSameDay(constants.today, state.date)) {
        return '';
    }
    return `
        <button type="button" id="today-button" class="btn text-light">
            <i class="bi-calendar-date-fill"></i>
        </button>`;
}

function renderNewButton() {
    if (state.viewMode === 'manageTags' && state.new) {
        return '';
    }
    return `
        <button class="btn btn-light" type="button" title="Neu" onclick="startNew();">
            <i class="bi-plus-square"></i><span class="d-none d-sm-inline-block">&nbsp;Neu</span>
        </button>`;
}

function render() {
    return `
        <div class="container">
            <div class="navbar-brand">
                ${renderBrandContent()}
            </div>
            ${state.viewMode !== 'manageTags' ? `
            <form class="d-flex">
                ${renderTodayButton()}
                ${renderNewButton()}
            </form>` : ''}
        </div>`;
}

function onAttach() {
    if (state.viewMode === 'monthDisplay') {
        document.getElementById('previous-month-button').addEventListener('click', () => expensesApp.setDate(dates.decrementMonth(state.date)));
        document.getElementById('next-month-button').addEventListener('click', () => expensesApp.setDate(dates.incrementMonth(state.date)));
        document.getElementById('manage-tags-button').addEventListener('click', () => expensesApp.setViewMode('manageTags'));
    }
    if (state.viewMode === 'manageTags') {
        document.getElementById('month-display-button').addEventListener('click', () => expensesApp.setViewMode('monthDisplay'));
    }


    const todayButton = document.getElementById('today-button');
    if (todayButton) {
        todayButton.addEventListener('click', () => expensesApp.setDate(constants.today));
    }
}

export { render, onAttach };
