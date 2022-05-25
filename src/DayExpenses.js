import * as App from './App.js';
import * as positions from './positions.js';

import state from './state.js';

function renderAmountTd(content) {
    return `<td class="text-end">${content}</td>`;
}

function render() {
    positions.refreshDayExpenses();

    let rows = `
        <div class="col-lg-4 mt-lg-content ${state.monthDisplay === 'overview' ? 'd-none d-lg-block' : ''}">
            <h5 class="d-flex">
                <span class="me-auto">
                    ${App.renderDayHeading(state.date)}
                </span>
                <span>
                    ${App.isSubCent(state.dayExpenses.data.sum) ? '' : App.renderFloat(state.dayExpenses.data.sum)}
                </span>
                <span class="currency"></span>
            </h5>`;
    rows += state.dayExpenses.data.expenses
        .map(e => `
            <div data-xpns-id="${e._id}" class="d-flex py-1 border-top cursor-pointer xpns-hover">
                <div class="d-flex overflow-hidden text-nowrap me-auto">
                    ${App.decorateTags(e.description, l => `<div class="overflow-hidden me-1">${l}</div>`)}
                </div>
                <div class="pe-1">${renderAmountTd(App.renderFloat(positions.computeMonthlyAmount(e)))}</div>
                <div class="currency">${App.isDefaultCurrency(e.currency) ? '' : e.currency}</div>
            </div>`)
        .join('\n');
    rows += `</div>`;

    return rows;
}

export { render };
