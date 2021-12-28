import state from './state.js';
import * as constants from './constants.js';

function renderBrandContent() {
    if (state.viewMode === 'monthDisplay') {
        const monthLabel = constants.monthFormat.format(state.date);
        return `
            <button class="btn text-light" title="Tags bearbeiten" onclick="setViewMode('manageTags')"><i class="bi-tags-fill"></i></button>
            <button class="btn text-light" onclick="setDate(decrementMonth(state.date));">
                <i class="bi-chevron-left"></i>
            </button>
            <button class="btn text-light" onclick="setDate(incrementMonth(state.date));">
                <i class="bi-chevron-right"></i>
            </button>
            ${monthLabel}`
    }
    if (state.viewMode === 'manageTags') {
        return `
            <button type="button" class="btn text-light" onclick="setViewMode('monthDisplay');">
                <i class="bi-arrow-left"></i>
            </button>
            Markierungen verwalten`;
    }
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
                ${renderNewButton()}
            </form>` : ''}
        </div>`;
}

export { render };
