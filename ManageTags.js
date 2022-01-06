import * as tags from './tags.js';
import * as expensesApp from './expensesApp.js';
import * as constants from './constants.js';
import * as TagForm from './TagForm.js';
import state from './state.js';

function renderCategoryHierarchy() {
    let result = '';
    let previousLevel = 0;
    tags.visitHierarchy((name, level, children) => {
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
                    ${tags.render(name, 'cursor-pointer')}
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

    let tagForm = state.edit ? TagForm.render() : '';

    return categoryHierarchy + tagForm;
}

function onAttach() {
    const categoryBadges = document.querySelectorAll('span[data-xpns-tag]');
    for (const categoryBadge of categoryBadges) {
        categoryBadge.addEventListener('click', evt => expensesApp.startLineEdit(evt.target.dataset.xpnsTag));
    }
    if (state.edit) {
        TagForm.onAttach();
    }
}

export { render, onAttach };
