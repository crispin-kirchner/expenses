import * as expenses from './expenses.js';
import * as expensesApp from './App.js';

import state from './state.js';

function renderAmountTd(content) {
    return `<td class="text-end">${content}</td>`;
}

function render() {
    expenses.refreshDayExpenses();

    const renderSum = state.dayExpenses.data.sum > 0.005;

    let rows = `
          <div id="day-expenses" class="col-lg-4 mt-lg-content">
              <nav class="nav border-bottom border-top">
                <span class="nav-link px-0 me-auto">
                    ${expensesApp.renderDayHeading(state.date)}
                </span>
                <span class="nav-link px-2">
                    ${renderSum ? expensesApp.renderFloat(state.dayExpenses.data.sum) : ''}
                </span>
              </nav>
              <table class="table table-sm table-hover">`;
    rows += state.dayExpenses.data.expenses
        .map(e => `
              <tr data-xpns-id="${e._id}">
                  <td class="text-nowrap">${expensesApp.decorateTags(e.description)}</td>
                  ${renderAmountTd(expensesApp.renderFloat(expenses.computeMonthlyAmount(e)))}
                  <td>${expensesApp.isDefaultCurrency(e.currency) ? '' : e.currency}</td>
              </tr>`)
        .join('\n');
    rows += `</table>
          </div>`;

    return rows;
}

export { render };
