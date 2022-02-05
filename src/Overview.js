import * as constants from './constants.js';
import * as expenses from './expenses.js';
import * as expensesApp from './App.js';

import state from './state';

function computeTotal(rows) {
    const sum = rows.reduce((sum, row) => row.id === 'income' ? sum + row.amount : sum - row.amount, 0);
    return {
        title: 'Verbleibend',
        amount: sum,
        currency: constants.DEFAULT_CURRENCY
    };
}

function render() {
    expenses.refreshOverviewData();

    const rows = state.overviewData.data;
    let result = renderOverviewRowsRecursive(rows, '', 0);
    result += renderTopLevelRow(renderRow(computeTotal(rows)));
    return result;
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

function renderTopLevelRow(content) {
    return `
          <div class="bg-dark text-light rounded p-2 mt-2">
              <ul class="m-0">
                  ${content}
              </ul>
          </div>`;
}

function renderRow(row, children, childrenId) {
    let title = row.title;
    if (row.ex) {
        title = expensesApp.decorateTags(row.title);
    }
    if (row.id && row.category && row.id === row.category) {
        title = expensesApp.decorateTags('#' + row.title);
    }

    const renderAmount = row.amount > 0.005;

    return `
          <li>
              <a href="#" class="btn text-light ${row.ex && row.ex === state.editedPosition.data?._id ? 'btn-secondary active' : ''}" data-xpns-id="${row.ex || ''}" ${children ? `data-bs-toggle="collapse" data-bs-target="#${childrenId}"` : ''}>
                  ${title}
              </a>
              <span class="float-end">
                  <span>${renderAmount ? expensesApp.renderFloat(row.amount) : ''}</span>
                  <span class="currency">${expensesApp.isDefaultCurrency(row.currency) ? '' : row.currency}</span>
              </span>
              ${children ? children : ''}
          </li>`;
}

function renderOverviewRowRecursive(row, path, level) {
    const childrenId = `child-items-${path !== '' ? path + '-' : ''}${row.id}`;
    let children = null;
    if (row.childRows.length !== 0) {
        children = `
                  <div id="${childrenId}" class="collapse ${isExpanded(childrenId) ? 'show' : ''}">
                      ${renderOverviewRowsRecursive(row.childRows, path + row.id, level + 1)}
                  </div>`;
    }

    let html = renderRow(row, children, childrenId);

    if (level === 0) {
        html = renderTopLevelRow(html);
    }

    return html;
}

function renderOverviewRowsRecursive(rows, path, level) {
    let html = '';

    if (level !== 0) {
        html += `<ul>`;
    }

    html += rows
        .map(row => renderOverviewRowRecursive(row, path, level))
        .join('\n');

    if (level !== 0) {
        html += '</ul>';
    }

    return html;
}

export { render };
