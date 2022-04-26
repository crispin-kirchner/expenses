import * as FormState from './FormState.js';
import * as TagForm from './TagForm.js';
import * as expensesApp from './App.js';
import * as labels from './labels.js';

import state from './state.js';

function renderCategoryHierarchy() {
    labels.refresh();
    let result = '';
    let previousLevel = 0;
    labels.visitHierarchy((name, level, children) => {
        if (previousLevel < level) {
            result += '<ul class="mt-1 mb-1">'.repeat(level - previousLevel);
        }
        if (previousLevel > level) {
            result += '</ul>'.repeat(previousLevel - level);
        }
        if (level === 0) {
            result += `<h2>${name}</h2>`;
            if (Object.entries(children).length === 0) {
                result += `<p>Keine Markierungen</p>`;
            }
        }
        else {
            result += `
                <li class="mt-2 mb-1">
                    ${labels.render(name, 'cursor-pointer')}
                </li>`;
        }
        previousLevel = level;
    });
    return result;
}

function render() {
    const categoryHierarchy = `
        <div class="mt-content col-lg-8 col-sm-6">
            ${renderCategoryHierarchy()}
        </div>`;

    let tagForm = state.form === FormState.EDIT ? TagForm.render() : '';

    return categoryHierarchy + tagForm;
}

function startEditLabel(labelId) {
    state.form = FormState.EDIT;
    state.editedLabelId = labelId;
    expensesApp.render();
}

function onAttach() {
    const categoryBadges = document.querySelectorAll('span[data-xpns-tag]');
    for (const categoryBadge of categoryBadges) {
        categoryBadge.addEventListener('click', evt => startEditLabel(evt.target.dataset.xpnsTag));
    }
    if (state.form === FormState.EDIT) {
        TagForm.onAttach();
    }
}

export { render, onAttach };
