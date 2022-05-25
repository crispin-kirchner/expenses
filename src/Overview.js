import * as App from './App.js';
import * as OverviewTreemap from './OverviewTreemap.js';
import * as positions from './positions.js';

import state from './state';

function render() {
    positions.refreshOverviewData();
    return OverviewTreemap.render() + renderOverviewRows();
}

function renderRowTitle(row, containerId) {
    let title = row.title;
    if(row.id && row.category && row.id === row.category) {
        title = `#${title}`;
    }
    return `
        <span 
            class="w-100 p-1 text-start btn text-light ${row.ex && row.ex === state.editedPosition.data?._id ? 'btn-secondary active' : ''}" 
            data-xpns-id="${row.ex || ''}" 
            data-bs-toggle="collapse" 
            data-bs-target="#${containerId}">
                ${App.decorateTags(title)}
                <span class="float-end">
                    <span>${App.isSubCent(row.amount) ? '' : App.renderFloat(row.amount)}</span>
                    <span class="currency">${App.isDefaultCurrency(row.currency) ? '' : row.currency}</span>
                </span>
        </span>`;
}

function renderInnerRow(row, path) {
    let result = '';
    const containerId = ['child-items', ...path].join('-');
    result += `<li>${renderRowTitle(row, containerId)}`;
    if(row.childRows.length > 0) {
        result += `<ul class="collapse ${isExpanded(containerId) ? 'show' : ''}" id="${containerId}">`;
        for(const childRow of row.childRows) {
            result += renderInnerRow(childRow, [...path, childRow.id]);
        }
        result += '</ul>';
    }
    result += '</li>';
    return result;
}

function renderOverviewRows() {
    let result = '';
    for(const rootRow of state.overviewData.data) {
        result += `
            <div class="bg-dark text-light rounded p-2 mt-2">
                <ul class="m-0">
                    ${renderInnerRow(rootRow, [rootRow.id])}
                </ul>
            </div>`;
    }
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
