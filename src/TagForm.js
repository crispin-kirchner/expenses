import * as colors from './colors.js';
import * as constants from './constants.js';
import * as expensesApp from './App.js';
import * as labels from './labels.js';

import state from './state.js';

async function handleSubmit(evt) {
    evt.preventDefault();
    const label = { ...labels.getByName(state.editedLabelId) };

    label.parent = getParentSelect().value;
    label.color = getColorSelect().value;
    await labels.store(label);

    state.form = null;
    expensesApp.render()
}

function removeClasses(elem, classArray) {
    elem.classList.remove.apply(elem.classList, classArray);
}

function addClasses(elem, classArray) {
    elem.classList.add.apply(elem.classList, classArray);
}

function getTextClass(classArray) {
    const textClasses = classArray.filter(c => c.startsWith('text-'));
    return textClasses;
}

function handleColorSelectChange(evt) {
    const oldColorValue = evt.target.dataset.xpnsOldValue;
    const oldColorClasses = colors.getClasses(oldColorValue);

    const tagSpan = getTagContainer().querySelector(`span.badge[data-xpns-tag="${state.editedLabelId}"]`);
    const label = document.querySelector('label[for="color-select"]');

    removeClasses(evt.currentTarget, oldColorClasses);
    removeClasses(tagSpan, oldColorClasses);
    removeClasses(label, getTextClass(oldColorClasses));

    const newColorClasses = colors.getClasses(evt.target.value);
    addClasses(evt.target, newColorClasses);
    addClasses(tagSpan, newColorClasses);
    addClasses(label, getTextClass(newColorClasses));
    evt.target.dataset.xpnsOldValue = evt.target.value;
}

function getForm() {
    return document.getElementById('tag-form');
}

function getParentSelect() {
    return document.getElementById('parent-select');
}

function getColorSelect() {
    return document.getElementById('color-select');
}

function getTagContainer() {
    return document.getElementById('tag-container');
}

function renderParentOptions() {
    const tag = labels.getByName(state.editedLabelId);
    const options = [];
    const disabledParents = [];
    labels.visitHierarchy((name, level) => {
        const currentTag = labels.getByName(name);
        const isDisabled = name === tag._id || disabledParents.includes(currentTag.parent);
        if (isDisabled) {
            disabledParents.push(name);
        }
        options.push(`
            <option value="${name}" ${name === tag.parent ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}>
                ${'&nbsp;'.repeat(level * 2) + name}
            </option>`);
    });
    return options.join('\n');
}

function render() {
    const tag = labels.getByName(state.editedLabelId);
    const colorClasses = colors.getClasses(tag.color);

    const colorOptions = Object.entries(colors.all)
        .sort((e1, e2) => e1[1].name.localeCompare(e2[1].name, constants.preferredLocale))
        .map(e => `<option ${e[0] === tag.color ? 'selected' : ''} class="${e[1].classes.join(' ')} fw-bold" value="${e[0]}">${e[1].name}</option>`)
        .join('\n');

    return `
        <div class="col-lg-4 col-sm-6 pt-3 pt-sm-0 mt-sm-content position-absolute h-100 bg-white end-0 z-top">
            <div class="d-flex align-items-center mb-2">
                <h2 class="me-auto">Bearbeiten</h2>
                <button type="button" class="btn-close" aria-label="Close" onclick="cancelLineEdit();"></button>
            </div>
            <div id="tag-container" class="mb-3">
                ${labels.render(state.editedLabelId)}
            </div>
            <form id="tag-form" novalidate>
                <div class="form-floating mb-3">
                    <select id="parent-select" class="form-select" placeholder="Übergeordnet">
                        ${renderParentOptions()}
                    </select>
                    <label for="parent-select">Übergeordnet</label>
                </div>
                <div class="form-floating mb-3">
                    <select id="color-select"
                        placeholder="Farbe"
                        class="form-select ${colorClasses.join(' ')} fw-bold"
                        data-xpns-old-value="${tag.color}">
                        ${colorOptions}
                    </select>
                    <label for="color-select" class="${getTextClass(colorClasses).join(' ')}">Farbe</label>
                </div>
                <div class="d-flex">
                    <button type="submit" class="btn btn-primary ms-auto"><i class="bi-check-circle"></i> Speichern</button>
                </div>
            </form>
        </div>`;
}

function onAttach() {
    getForm().addEventListener('submit', handleSubmit);
    getColorSelect().addEventListener('change', handleColorSelectChange);
}

export { render, onAttach };
