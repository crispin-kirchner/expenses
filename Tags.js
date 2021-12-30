import state from './state.js'
import * as colors from './colors.js';
import * as constants from './constants.js';

function getIndexByName(name) {
    return state.data.categories.findIndex(c => c.name === name);
}

function getByName(name) {
    const index = getIndexByName(name);
    if (index < 0) {
        return null;
    }
    return state.data.categories[index];
}

function render(tagName, additionalClasses) {
    const classes = getClasses(tagName);
    return `<span class="badge ${classes.join(' ')} ${additionalClasses ? additionalClasses : ''}" data-xpns-tag="${tagName}">${tagName}</span>`;
}

function getClasses(tagName) {
    const classes = colors.getClasses(getByName(tagName)?.color);
    return classes ? classes : colors.get(constants.defaultTagColor).classes;
}

function getAll() {
    const set = new Set(state.data.expenses.flatMap(e => e.getTags()));
    return [...set];
}

export { getByName, render, getAll, getIndexByName };
