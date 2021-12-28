"use strict";

import * as colors from '/colors.js';
import * as tags from './tags.js';
import * as expenses from './expensesApp.js';
import * as constants from './constants.js';
import state from './state.js';

function renderLine(tagName) {
    const tag = tags.getByName(tagName) || { name: tagName, color: 'gray' };

    const editColor = tag.color;

    const colorOptions = Object.entries(colors.all)
        .map(e => `<option ${e[0] === editColor ? 'selected' : ''} class="${e[1].classes.join(' ')}" value="${e[0]}">${e[1].name}</option>`)
        .join('\n');

    const colorClasses = colors.getClasses(editColor);

    return `
        <div class="d-flex mb-2 align-items-center">
            ${tags.render(tag.name, 'me-auto')}
            <select
                class="form-select ${colorClasses.join(' ')} fit-content"
                data-xpns-tag="${tag.name}"
                data-xpns-old-value="${tag.color}">
                ${colorOptions}
            </select>
        </div>`
}

function removeClasses(elem, classArray) {
    elem.classList.remove.apply(elem.classList, classArray);
}

function addClasses(elem, classArray) {
    elem.classList.add.apply(elem.classList, classArray);
}

function handleColorSelectChange(evt) {
    const oldColorValue = evt.target.dataset.xpnsOldValue;
    const oldColorClasses = colors.getClasses(oldColorValue);
    const tagSpan = document.querySelector(`span.badge[data-xpns-tag="${evt.target.dataset.xpnsTag}"]`);
    removeClasses(evt.target, oldColorClasses);
    removeClasses(tagSpan, oldColorClasses);

    const newColorClasses = colors.getClasses(evt.target.value);
    addClasses(evt.target, newColorClasses);
    addClasses(tagSpan, newColorClasses);
    evt.target.dataset.xpnsOldValue = evt.target.value;

    let tag = tags.getByName(evt.target.dataset.xpnsTag);
    if (!tag) {
        tag = { name: evt.target.dataset.xpnsTag };
        state.data.categories.push(tag);
    }
    tag.color = evt.target.value;

    expenses.setSaved(false);
    expenses.render();
    expenses.save();
}

function render() {
    const categoryList = tags.getAll()
        .sort((a, b) => a.localeCompare(b, constants.preferredLocale))
        .map(renderLine)
        .join('\n');

    return `
        <div class="mt-content">
            ${categoryList}
        </div>`;
}

function onAttach() {
    const colorSelects = document.querySelectorAll('select[data-xpns-tag]');
    for (const colorSelect of colorSelects) {
        colorSelect.addEventListener('change', handleColorSelectChange);
    }
}

export { render, onAttach };
