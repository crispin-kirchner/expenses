import * as App from './App.js';
import * as OverviewTreemap from './OverviewTreemap.js';
import * as positions from './positions.js';

import state from './state';

function render() {
    positions.refreshOverviewData();
    return OverviewTreemap.render() + renderOverviewRows();
}

function renderOverviewRows() {
    let result = '';
    let previousLevel = 0;
    positions.visitOverviewData((row, path) => {
        const level = path.length;
        const velocity = level - previousLevel;
        if (velocity < 0) {
            const repetitions = velocity < 0 ? -velocity : 1;
            result += '</ul>'.repeat(repetitions);
        }
        if (level === 0) {
            if (velocity < 0) {
                result += '</ul></div>';
            }
            result += '<div class="bg-dark text-light rounded p-2 mt-2">';
        }
        const containerId = ['child-items', ...path.map(r => r.id)].join('-');
        if (level === 0 || velocity > 0) {
            result += `<ul class="m-0 ${level > 0 ? `collapse ${isExpanded(containerId) ? 'show' : ''}` : ''}" ${level > 0 ? `id="${containerId}"` : ''}>`;
        }

        let title = row.title;
        if (row.ex) {
            title = App.decorateTags(row.title);
        }
        if (row.id && row.category && row.id === row.category) {
            title = App.decorateTags('#' + row.title);
        }
        result += `
            <li>
                <span class="w-100 p-1 text-start btn text-light ${row.ex && row.ex === state.editedPosition.data?._id ? 'btn-secondary active' : ''}" data-xpns-id="${row.ex || ''}" data-bs-toggle="collapse" data-bs-target="#${containerId}-${row.id}">
                    ${title}
                    <span class="float-end">
                        <span>${App.isSubCent(row.amount) ? '' : App.renderFloat(row.amount)}</span>
                        <span class="currency">${App.isDefaultCurrency(row.currency) ? '' : row.currency}</span>
                    </span>
                </span>
            </li>`;
        previousLevel = level;
        return 'continue';
    });
    result += '</ul></div>';
    return result;
}

function onAttach() {
    OverviewTreemap.onAttach();
}

function isExpanded(path) {
    const components = path.split('-');

    let expandedPath = state.expandedPaths;
    for (let component of components) {
        expandedPath = expandedPath[component];
        if (!expandedPath) {
            return false;
        }
    }
    return true;
}

export { render, onAttach };
