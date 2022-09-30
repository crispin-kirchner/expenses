import * as App from './App.js';
import * as positions from './positions.js';

import state from './state.js';

function render() {
    positions.refreshDayExpenses();

    let rows = `<div class="col-lg-4 mt-lg-content ${state.monthDisplay === 'overview' ? 'd-none d-lg-block' : ''}">`;
    rows += App.renderHeading('h5', App.renderDayHeadingDate(state.date), state.dayExpenses.data.sum);
    rows += state.dayExpenses.data.expenses
        .map(pos => App.renderPositionRow(pos, { emphasizeIncome: true }))
        .join('\n');
    rows += `</div>`;

    return rows;
}

export { render };
