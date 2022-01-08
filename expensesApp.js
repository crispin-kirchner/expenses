import * as Navbar from './Navbar.js';
import * as ManageTags from './ManageTags.js';
import * as MonthChart from './MonthChart.js';
import * as Calendar from './Calendar.js';
import * as constants from './constants.js';
import * as tags from './tags.js';
import state from './state.js';
import * as Migration from './Migration.js';
import * as expenses from './expenses.js';

class ExpensesError {
    constructor(message, origins) {
        this.message = message;
        this.origins = origins;
    }
}

class Expense {
    constructor() {
        this.setId(uuidv4());
        this.setCreateDate(new Date(Date.now()));
    }

    getId() {
        return this._id;
    }

    setId(id) {
        this._id = id;
    }

    getType() {
        return this._type;
    }

    setType(type) {
        this._type = type;
    }

    getDate() {
        return this._date;
    }

    setDate(date) {
        if (typeof date === 'string') {
            this._date = new Date(date);
            return;
        }
        this._date = date;
    }

    getAmount() {
        return this._amount;
    }

    setAmount(amount) {
        if (typeof amount !== 'string') {
            throw 'Amount must be a string';
        }
        this._amount = amount;
    }

    getCurrency() {
        return this._currency;
    }

    setCurrency(currency) {
        this._currency = currency;
    }

    getExchangeRate() {
        return this._exchangeRate;
    }

    setExchangeRate(exchangeRate) {
        if (typeof exchangeRate !== 'string') {
            throw 'Exchange rate must be a string';
        }
        this._exchangeRate = exchangeRate;
    }

    getDescription() {
        return this._description;
    }

    setDescription(description) {
        this._description = description.trim();
    }

    getCreateDate() {
        return this._createDate;
    }

    setCreateDate(createDate) {
        if (typeof createDate === 'string') {
            this._createDate = new Date(createDate);
            return;
        }
        this._createDate = createDate;
    }

    isRecurring() {
        return this._recurring;
    }

    setRecurring(recurring) {
        if (recurring) {
            this.setDate(null);
        }
        else {
            this.setRecurrencePeriodicity(null);
            this.setRecurrenceFrequency(null);
            this.setRecurrenceFrom(null);
            this.setRecurrenceTo(null);
        }
        this._recurring = recurring;
    }

    getRecurrencePeriodicity() {
        return this._recurrencePeriodicity;
    }

    setRecurrencePeriodicity(recurrencePeriodicity) {
        this._recurrencePeriodicity = recurrencePeriodicity;
    }

    getRecurrenceFrequency() {
        return this._recurrenceFrequency;
    }

    setRecurrenceFrequency(recurrenceFrequency) {
        if (typeof recurrenceFrequency === 'string') {
            this._recurrenceFrequency = parseInt(recurrenceFrequency);
            return;
        }
        this._recurrenceFrequency = recurrenceFrequency;
    }

    getRecurrenceFrom() {
        return this._recurrenceFrom;
    }

    setRecurrenceFrom(recurrenceFrom) {
        if (typeof recurrenceFrom === 'string') {
            this._recurrenceFrom = new Date(recurrenceFrom);
            return;
        }
        this._recurrenceFrom = recurrenceFrom;
    }

    getRecurrenceTo() {
        return this._recurrenceTo;
    }

    setRecurrenceTo(recurrenceTo) {
        if (typeof recurrenceTo === 'string') {
            this._recurrenceTo = new Date(recurrenceTo);
            return;
        }
        this._recurrenceTo = recurrenceTo;
    }

    getTags() {
        let m = null;
        const tags = [];
        while (m = constants.tagRegex.exec(this.getDescription())) {
            tags.push(m[1]);
        }
        return tags;
    }

    hasCategory(category) {
        return this.getTags().includes(category);
    }

    computeAmountChf() {
        if (isDefaultCurrency(this.getCurrency())) {
            return parseFloat(this.getAmount());
        }
        return parseFloat(this.getExchangeRate()) * parseFloat(this.getAmount());
    }

    computeMonthlyAmountChf() {
        return parseFloat(this.getExchangeRate()) * this.computeMonthlyAmount();
    }

    computeMonthlyAmount() {
        if (this.isRecurring()) {
            let amountByFrequency = parseFloat(this.getAmount()) / this.getRecurrenceFrequency();
            if (this.getRecurrencePeriodicity() === 'monthly') {
                return amountByFrequency;
            }
            if (this.getRecurrencePeriodicity() === 'yearly') {
                return amountByFrequency / 12;
            }
        }
        return parseFloat(this.getAmount());
    }

    isValidOnDate(date) {
        if (this.isRecurring()) {
            return isValidInMonth(this.getRecurrenceFrom(), this.getRecurrenceTo(), date);
        }
        return isSameDay(date, this.getDate());
    }

    isValidInMonth(month) {
        if (this.isRecurring()) {
            return isValidInMonth(this.getRecurrenceFrom(), this.getRecurrenceTo(), month);
        }
        return isInMonth(this.getDate(), month);
    }
}

window.onerror = (msg, url, lineNo, columnNo, error) => {
    if (error instanceof ExpensesError) {
        error.origins.forEach(o => o.classList.add('error'))
        alert(error.message);
        return;
    }
    throw error;
};

window.addEventListener('beforeunload', e => {
    if (!state.saved) {
        e.preventDefault();
        e.returnValue = 'Ungespeicherte Änderungen vorhanden';
    }
});

document.onkeydown = e => {
    if (e.key === 'Enter') {
        if (['description', 'amount', 'currency-input', 'date-input', 'exchange-rate', 'recurring-checkbox', 'recurring-frequency', 'recurring-monthly', 'recurring-yearly', 'recurring-from', 'recurring-to', 'type-select'].includes(e.target.id)) {
            if (e.ctrlKey) {
                submitForm();
            }
            // disable Enter-only for submitting
            return false;
        }
    }
    if (e.key === 'Escape') {
        cancelLineEdit();
        return false;
    }
    if (e.ctrlKey) {
        if (e.key === 's') {
            save();
            return false;
        }
        if (e.key === 'Insert') {
            startNew();
            return false;
        }
    }
    if (e.target.id === 'description' && e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!getProposalField().querySelector('option')) {
            return false;
        }
        const selectedOption = getProposalField().querySelector('option:checked');
        let sibling;
        if (!selectedOption || !(sibling = e.key === 'ArrowDown' ? selectedOption.nextElementSibling : selectedOption.previousElementSibling)) {
            sibling = e.key === 'ArrowDown' ? getProposalField().querySelector('option:first-child') : getProposalField().querySelector('option:last-child');
        }
        sibling.selected = true;
        getDescriptionInput().value = sibling.value;
        if (typeof state.descriptionCaretPosition === 'number') {
            getDescriptionInput().setSelectionRange(state.descriptionCaretPosition, state.descriptionCaretPosition);
        }
        return false;
    }
    return true;
};

/*
 * DateUtility
 */
function dateToYmd(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, 0)}`;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate()
        && d1.getMonth() === d2.getMonth()
        && d1.getFullYear() === d2.getFullYear();
}

function getFirstDayOfNextMonth(date) {
    return incrementMonth(date).setDate(1);
}

function incrementMonth(date) {
    if (date.getMonth() == 11) {
        return new Date(date.getFullYear() + 1, 0, date.getDate());
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function decrementMonth(date) {
    if (date.getMonth() == 0) {
        return new Date(date.getFullYear() - 1, 11, date.getDate());
    }
    return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
}

function isInMonth(date, month) {
    const firstDayOfNextMonth = getFirstDayOfNextMonth(month);
    const firstDayOfCurrentMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    return date < firstDayOfNextMonth && date >= firstDayOfCurrentMonth;
}

function isValidInMonth(validFrom, validTo, month) {
    const firstDayOfNextMonth = getFirstDayOfNextMonth(month);
    const firstDayOfCurrentMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    return validFrom < firstDayOfNextMonth && (!validTo || validTo >= firstDayOfCurrentMonth);
}

/*
 * Data store
 */
function setDate(date) {
    state.date = date;
    render();
}

function getCurrentDayString() {
    return dateToYmd(state.date);
}

function or(item, filters) {
    for (const filter of filters) {
        if (filter(item)) {
            return true;
        }
    }
    return false;
}

function groupByType(rowsFeatured, subGroupingFn) {
    const rows = [];
    for (const fd of Object.entries(constants.typeFilters)) {
        const childRows = subGroupingFn(rowsFeatured
            .filter(r => r.type === fd[0]))
            .sort((e1, e2) => e2.amountChf - e1.amountChf);

        const amountChf = childRows.reduce((sum, row) => sum += row.amountChf, 0);
        rows.push({
            title: fd[1].name,
            id: fd[0],
            amountChf: amountChf,
            amount: amountChf,
            currency: constants.DEFAULT_CURRENCY,
            childRows: childRows
        });
    }
    return rows;
}

function groupByCategory(rowsFeatured) {
    const outRows = [];
    return rowsFeatured
        .reduce((outRows, row) => {
            if (!row.category) {
                outRows.push(row);
                return outRows;
            }
            const index = outRows.findIndex(outRow => outRow.id === row.category);
            let outRow = null;
            if (index < 0) {
                outRow = {
                    title: row.category,
                    id: row.category,
                    amountChf: 0,
                    amount: 0,
                    currency: constants.DEFAULT_CURRENCY,
                    category: row.category,
                    childRows: []
                };
                outRows.push(outRow);
            }
            else {
                outRow = outRows[index];
            }
            outRow.amountChf += row.amountChf;
            outRow.amount += row.amountChf;
            outRow.childRows.push(row);
            row.title = row.title.replace(new RegExp(`\\s#${row.category}(?:\\b|$)`), '');
            return outRows;
        }, [])
        .map(or => {
            or.childRows.sort((e1, e2) => e2.amountChf - e1.amountChf);
            return or;
        })
        .sort((e1, e2) => e2.amountChf - e1.amountChf);
}

function getOverviewData() {
    const currentDay = state.date;
    const filterDatas = Object.entries(constants.typeFilters);
    const filters = filterDatas.map(fd => fd[1].filter);

    const rowsFeatured = state.data.expenses
        .filter(ex => or(ex, filters))
        .filter(ex => ex.isValidInMonth(currentDay))
        .map(ex => {
            const row = {
                ex: ex.getId(),
                title: ex.getDescription(),
                amountChf: ex.computeMonthlyAmountChf(),
                amount: ex.computeMonthlyAmount(),
                currency: ex.getCurrency(),
                childRows: []
            };
            row['type'] = (() => {
                for (const filterData of filterDatas) {
                    if (filterData[1].filter(ex)) {
                        return filterData[0];
                    }
                }
            })();
            row['category'] = (() => {
                const standardCategories = state.data.categories
                    .filter(c => c.parent === constants.standardDimension);

                for (const category of standardCategories) {
                    if (ex.hasCategory(category.name)) {
                        return category.name;
                    }
                }
            })();
            return row;
        });

    return groupByType(rowsFeatured, groupByCategory);
}

/*
 * UI
 */
function getAmountInput() {
    return document.getElementById('amount');
}

function getAppArea() {
    return document.getElementById('app-area');
}

function getComputedChfValue() {
    return document.getElementById('computed-chf-value');
}

function getCurrencySelect() {
    return document.getElementById('currency-input');
}

function getDateInput() {
    return document.getElementById('date-input');
}

function getDescriptionInput() {
    return document.getElementById('description');
}

function getExchangeRateInput() {
    return document.getElementById('exchange-rate');
}

function getExpenseForm() {
    return document.getElementById('expense-form');
}

function getNavbar() {
    return document.getElementById('navbar');
}

function getProposalField() {
    return document.getElementById('proposal-field');
}

function getRecurringCheckbox() {
    return document.getElementById('recurring-checkbox');
}

function getRecurringFrequency() {
    return document.getElementById('recurring-frequency');
}

function getRecurringFrom() {
    return document.getElementById('recurring-from');
}

function getRecurringFromToLabelSep() {
    return document.getElementById('recurring-fromto-label-sep');
}

function getRecurringFrequencySep() {
    return document.getElementById('recurring-frequency-sep');
}

function getRecurringMonthly() {
    return document.getElementById('recurring-monthly');
}

function getRecurringTo() {
    return document.getElementById('recurring-to');
}

function getRecurringYearly() {
    return document.getElementById('recurring-yearly');
}

function getTypeSelect() {
    return document.getElementById('type-select');
}

function renderFloat(f) {
    return constants.numberFormat.format(f);
}

function renderDay(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return constants.dayFormat.format(date);
}

function renderDayHeading(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return constants.dayHeadingFormat.format(date);
}

function decorateTags(description) {
    return description.replaceAll(constants.tagRegex, (m, p0) => tags.render(p0));
}

function getEditExpense() {
    if (!state.edit) {
        return null;
    }
    const index = state.data.expenses.findIndex(e => e.getId() === state.edit);
    return state.data.expenses[index];
}

function renderAmountTd(content) {
    return `<td class="text-end">${content}</td>`;
}

function setMonthDisplay(monthDisplay) {
    if (monthDisplay === state.monthDisplay) {
        return;
    }
    state.monthDisplay = monthDisplay;
    render();
}

function setViewMode(viewMode) {
    state.edit = null;
    state.new = false;
    state.viewMode = viewMode;
    render();
}

function renderMainArea() {
    const items = {
        overview: {
            icon: 'eyeglasses',
            name: 'Übersicht',
            callback: renderOverviewSections
        },
        calendar: {
            icon: 'calendar3',
            name: 'Kalender',
            callback: Calendar.render
        },
        chart: {
            icon: 'graph-up',
            name: 'Diagramm',
            callback: MonthChart.render
        }
    };

    const lis = Object.entries(items)
        .map(en => {
            const [item, props] = en;
            return `
                    <li class="nav-item">
                        <a class="nav-link ${state.monthDisplay === item ? 'active' : ''}" onclick="setMonthDisplay('${item}');" href="#"><i class="bi-${props.icon}"></i><span class="d-none d-sm-inline">&nbsp;${props.name}</span></a>
                    </li>`;
        });

    const content = items[state.monthDisplay].callback();

    return `
        <div class="col-lg-8 mt-content">
            <ul class="nav nav-tabs mb-2">
                ${lis.join('\n')}
            </ul>
            <div class="mb-4">
                ${content}
            </div>
        </div>`;
}

function render() {
    getNavbar().innerHTML = Navbar.render();

    let appArea;
    let expenseForm;
    if (state.viewMode === 'monthDisplay') {
        const mainArea = renderMainArea();
        const dayTable = state.monthDisplay === 'overview' ? '' : renderDayExpenses(renderDayHeading(state.date), e => e.getType() === 'expense' && !e.isRecurring(), false);
        expenseForm = renderForm();
        appArea = mainArea + dayTable + expenseForm;
    } else if (state.viewMode === 'manageTags') {
        appArea = ManageTags.render();
    }
    getAppArea().innerHTML = appArea;
    if (state.viewMode === 'manageTags') {
        ManageTags.onAttach();
    }
    if (state.viewMode === 'monthDisplay') {
        if (state.monthDisplay === 'chart') {
            MonthChart.onAttach();
        }
        if (state.monthDisplay === 'calendar') {
            Calendar.onAttach();
        }
    }
    if (expenseForm) {
        refreshFormView();
        getExpenseForm().addEventListener('submit', submitForm);
        getDescriptionInput().focus();
    }

    const collapsibles = document.querySelectorAll('.collapse');
    if (collapsibles) {
        collapsibles.forEach(n => {
            n.addEventListener('show.bs.collapse', e => { saveExpandedPath(e.target.id); });
            n.addEventListener('hide.bs.collapse', e => { removeExpandedPath(e.target.id); });
        });
    }

    const expenseLis = document.querySelectorAll('[data-xpns-id]:not([data-xpns-id=""])');
    for (const li of expenseLis) {
        li.addEventListener('click', selectExpense);
    }
}

function saveExpandedPath(newPath) {
    const components = newPath.split('-');

    let expandedPath = state.expandedPaths;
    for (let component of components) {
        expandedPath = (expandedPath[component] = expandedPath[component] || {});
    }
}

function removeExpandedPath(path) {
    const components = path.split('-');

    let expandedPath = state.expandedPaths;
    components.forEach((component, i) => {
        if (i === components.length - 1) {
            expandedPath[component] = null;
            return;
        }
        expandedPath = expandedPath[component];
    });
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

function renderDayExpenses(heading, filter, sort) {
    const currentDay = state.date;
    const expenses = state.data.expenses
        .filter(filter)
        .filter(ex => ex.isValidOnDate(currentDay));

    if (sort) {
        expenses.sort((e1, e2) => e2.computeMonthlyAmountChf() - e1.computeMonthlyAmountChf());
    }

    const sum = expenses
        .reduce((sum, e) => sum + e.computeMonthlyAmountChf(), 0.0);

    const renderSum = sum > 0.005;

    let rows = `
        <div id="day-expenses" class="col-lg-4 mt-lg-content">
            <nav class="nav border-bottom border-top"><span class="nav-link px-0 me-auto">${heading}</span><span class="nav-link px-2">${renderSum ? renderFloat(sum) : ''}</span></nav>
            <table class="table table-sm table-hover">`;
    rows += expenses
        .map(e => `
            <tr data-xpns-id="${e.getId()}" class="${state.edit === e.getId() ? 'table-active' : ''}">
                <td class="text-nowrap">${decorateTags(e.getDescription())}</td>
                ${renderAmountTd(renderFloat(e.computeMonthlyAmount()))}
                <td>${isDefaultCurrency(e.getCurrency()) ? '' : e.getCurrency()}</td>
            </tr>`)
        .join('\n');
    rows += `</table>
        </div>`;

    return rows;
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
        title = decorateTags(row.title);
    }
    if (row.id && row.category && row.id === row.category) {
        title = decorateTags('#' + row.title);
    }

    const renderAmount = row.amount > 0.005;

    return `
        <li>
            <a href="#" class="btn text-light ${row.ex && row.ex === state.edit ? 'btn-secondary active' : ''}" data-xpns-id="${row.ex || ''}" ${children ? `data-bs-toggle="collapse" data-bs-target="#${childrenId}"` : ''}>
                ${title}
            </a>
            <span class="float-end">
                <span>${renderAmount ? renderFloat(row.amount) : ''}</span>
                <span class="currency">${isDefaultCurrency(row.currency) ? '' : row.currency}</span>
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

function computeTotal(rows) {
    const sum = rows.reduce((sum, row) => row.id === 'income' ? sum + row.amount : sum - row.amount, 0);
    return {
        title: 'Verbleibend',
        amount: sum,
        currency: constants.DEFAULT_CURRENCY
    };
}

function renderOverviewSections() {
    const rows = getOverviewData();
    let result = renderOverviewRowsRecursive(rows, '', 0);
    result += renderTopLevelRow(renderRow(computeTotal(rows)));
    return result;
}

function renderMonthTable() {
    let tableContent = '<table class="table table-sm table-hover">';
    expenses.getDaysOfMonth(state.date)
        .forEach(d => tableContent += `
            <tr onclick="setDate('${dateToYmd(d.date)}');"
                ${getCurrentDayString() === dateToYmd(d.date) ? 'class="table-active"' : ''}>
                <td class="text-end">${renderDay(d.date)}</td>
                ${renderAmountTd(d.amount ? renderFloat(d.amount) : '')}
                <td>${d.description.join(', ')}</td>
                ${renderAmountTd(d.saved ? renderFloat(d.saved) : '')}
            </tr>`);
    return tableContent + '</table>';
}

/*
 * Form
 */
function refreshFormView() {
    [getRecurringFrequency(),
    getRecurringMonthly(),
    getRecurringYearly(),
    getRecurringFrequencySep()]
        .forEach(f => setVisible(f, getRecurringCheckbox().checked));

    [getRecurringFrom(),
    getRecurringFromToLabelSep(),
    getRecurringTo()]
        .forEach(f => setVisible(f, getRecurringCheckbox().checked));

    setVisible(getDateInput(), !getRecurringCheckbox().checked);
    setVisible(document.getElementById('form-line2'), !isDefaultCurrency(getCurrencySelect().value));
}

function handleTypeChanged() {
    refreshFormView();
}

function handleCurrencyChanged() {
    let exchangeRate = constants.defaultExchangeRate;
    if (!isDefaultCurrency(getCurrencySelect().value)) {
        const referenceDate = new Date(getDateInput().value !== '' ? getDateInput().value : getCurrentDayString());
        exchangeRate = getLastExchangeRate(getCurrencySelect().value, referenceDate) || exchangeRate;
    }
    getExchangeRateInput().value = exchangeRate;

    refreshFormView();
}

function handleRecurringCheckboxChanged() {
    if (getRecurringCheckbox().checked) {
        getRecurringFrom().value = getDateInput().value;
        getDateInput().value = null;
    }
    else {
        getDateInput().value = getRecurringFrom().value;
        getRecurringFrom().value = null;
    }

    refreshFormView();
}

function getDictionary() {
    return state.data.expenses
        .map(e => e.getDescription())
        .reduce((dict, desc) => {
            if (dict[desc]) {
                dict[desc] += 1;
            }
            else {
                dict[desc] = 1;
            }
            return dict;
        }, {});
}

function setProposalFieldVisible(visible) {
    setVisible(getProposalField(), visible);
    toggleClass(getDescriptionInput(), 'rounded-0', visible);
}

function handleDescriptionInput() {
    state.proposalSelection = false;
    state.descriptionCaretPosition = getDescriptionInput().selectionStart;

    let searchString;
    if (state.descriptionCaretPosition) {
        searchString = getDescriptionInput().value.substring(0, state.descriptionCaretPosition);
    }
    else {
        searchString = getDescriptionInput().value;
    }
    const hasText = !!searchString.length;
    setProposalFieldVisible(hasText);
    if (hasText) {
        const dictionary = getDictionary();
        const proposals = Object.entries(dictionary)
            .filter(e => e[0].toLowerCase().startsWith(searchString.toLowerCase()))
            .sort((a, b) => b[1] - a[1]);

        if (proposals.findIndex(e => e[0] === getDescriptionInput().value) < 0) {
            getDescriptionInput().value = searchString;
        }

        getProposalField().innerHTML = proposals
            .map(p => `<option>${p[0]}</option>`)
            .join('\n');
    }
}

function handleDescriptionBlur() {
    state.descriptionCaretPosition = null;
    setProposalFieldVisible(state.proposalSelection);
    state.proposalSelection = false;
}

function handleProposalSelect() {
    state.descriptionCaretPosition = null;
    getDescriptionInput().value = getProposalField().value;
}

function handleProposalClick() {
    if (!getProposalField().classList.contains('d-none')) {
        state.proposalSelection = true;
    }
}

function renderForm() {
    if (!state.edit && !state.new) {
        return '';
    }

    const expense = getEditExpense();
    const currencies = ['CHF', '€'];
    const defaultCurrency = expense ? isDefaultCurrency(expense.getCurrency()) : true;
    const expenseSelected = !expense || expense.getType() === 'expense';
    let form = `
        <div class="col-lg-4 position-absolute end-0 bg-white pt-3 pt-lg-0 mt-lg-content h-100 z-top">
            <form id="expense-form" autocomplete="off" novalidate>
                <div class="d-flex align-items-center mb-2">
                    <h2 class="me-auto">${state.edit ? 'Bearbeiten' : 'Neu'}</h2>
                    <button type="button" class="btn-close" aria-label="Close" onclick="cancelLineEdit();"></button>
                </div>
                <div class="form-floating mb-3">
                    <select id="type-select" class="form-select" placeholder="Typ" onchange="handleTypeChanged();">
                        <option value="expense" ${expenseSelected ? 'selected' : ''}>Ausgabe</option>
                        <option value="income" ${expense?.getType() === 'income' ? 'selected' : ''}>Einnahme</option>
                    </select>
                    <label for="type-select">Typ</label>
                </div>
                <div class="form-floating">
                    <input id="description" class="form-control rounded-top" placeholder="Beschreibung" value="${expense ? expense.getDescription() : ''}" oninput="handleDescriptionInput()" onmousedown="handleProposalClick()" onblur="handleDescriptionBlur()" />
                    <label for="description">Beschreibung</label>
                </div>
                <div class="mb-3">
                    <select id="proposal-field" class="form-select d-none overflow-auto border-top-0 rounded-bottom rounded-0" size="4" tabindex="-1" onchange="handleProposalSelect()" onmousedown="handleProposalClick()" onblur="handleDescriptionBlur()">
                    </select>
                </div>
                <div class="row g-2">
                    <div class="col-8 form-floating">
                        <input id="amount" class="form-control text-end" placeholder="Betrag" oninput="handleAmountOrExchangeRateInput();" onchange="validateDecimalField(getAmountInput(), 2);" value="${expense ? expense.getAmount() : ''}" />
                        <label for="amount">Betrag</label>
                    </div>
                    <div class="col-4 form-floating">
                        <select id="currency-input" class="form-select" onchange="handleCurrencyChanged()" required>
                            ${currencies.map(c => `<option value="${c}" ${c === expense?.getCurrency() ? 'selected' : ''}>${c}</option>`)}
                        </select>
                        <label for="currency-input">Währung</label>
                    </div>
                </div>
                <div id="form-line2" class="input-group mt-2">
                    <span class="input-group-text">Wechselkurs</span>
                    <input class="form-control text-end" id="exchange-rate" oninput="handleAmountOrExchangeRateInput();" onchange="validateDecimalField(getExchangeRateInput(), 5);" value="${expense ? expense.getExchangeRate() : constants.defaultExchangeRate}" />
                    <span class="input-group-text">
                        <span id="computed-chf-value">${defaultCurrency ? '0.00' : renderFloat(expense?.computeAmountChf())}</span>
                        <span>&nbsp;${constants.DEFAULT_CURRENCY}</span>
                    </span>
                </div>
                <div class="form-floating mt-3">
                    <input id="date-input" class="form-control" type="date" value="${expense?.getDate() ? dateToYmd(expense.getDate()) : (expense ? '' : getCurrentDayString())}" />
                    <label for="date-input">Datum</label>
                </div>
                <div class="form-check form-switch mt-4">
                    <input id="recurring-checkbox" class="form-check-input" type="checkbox" onchange="handleRecurringCheckboxChanged();" ${expense?.isRecurring() ? 'checked' : ''} />
                    <label for="recurring-checkbox" class="form-check-label">Wiederkehrend</label>
                </div>
                <div>
                    <input id="recurring-frequency" type="number" class="text-end" size="2" maxlength="2" value="${expense?.isRecurring() ? expense.getRecurrenceFrequency() : '1'}" onchange="validateIntegerField(getRecurringFrequency());" /><span id="recurring-frequency-sep">-</span>
                    <input id="recurring-monthly" name="recurring-periodicity" type="radio" ${!expense?.isRecurring() || expense.getRecurrencePeriodicity() === 'monthly' ? 'checked' : ''} /><label for="recurring-monthly">Monatlich</label>
                    <input id="recurring-yearly" name="recurring-periodicity" type="radio" ${expense?.getRecurrencePeriodicity() === 'yearly' ? 'checked' : ''} /><label for="recurring-yearly">Jährlich</label>
                </div>
                <div id="recurring-fromto">
                    <label for="recurring-from">Start</label><label id="recurring-fromto-label-sep">/</label><label for="recurring-to">Ende</label>
                    <input id="recurring-from" type="date" value="${expense?.isRecurring() ? dateToYmd(expense.getRecurrenceFrom()) : ''}" />
                    <input id="recurring-to" type="date" value="${expense?.getRecurrenceTo() ? dateToYmd(expense.getRecurrenceTo()) : ''}" />
                </div>
                <div class="d-flex mt-4">
                    ${expense ? `<button class="btn btn-secondary" type="button" title="Löschen" onclick="removeExpense(state.edit);"><i class="bi-trash"></i> Löschen</button>` : ''}
                    <button class="btn btn-primary ms-auto" type="submit" title="${expense ? 'Speichern' : 'Hinzufügen'}">${expense ? '<i class="bi-check-circle"></i> Speichern' : '<i class="bi-plus-circle"></i> Hinzufügen'}</button>
                </div>
            </form>
        </div>`;

    return form;
}

function getLastExchangeRate(currency, date) {
    const expensesOfDay = state.data.expenses
        .filter(e => e.getCurrency() && e.getDate() && isSameDay(e.getDate(), date));
    let relevantExpenses = expensesOfDay;

    if (expensesOfDay.length === 0) {
        const expensesOfCurrency = state.data.expenses
            .filter(e => e.getType() === 'expense' && e.getCurrency() === getCurrencySelect().value);

        if (expensesOfCurrency.length === 0) {
            return null;
        }
        relevantExpenses = expensesOfCurrency;
    }

    return relevantExpenses
        .reduce((latest, e) => e.getCreateDate() > latest.getCreateDate() ? e : latest)
        .getExchangeRate();
}

function setVisible(field, visible) {
    const elements = [field];
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) {
        elements.push(label);
    }
    elements.forEach(el => toggleClass(el, 'd-none', !visible));
}

function toggleClass(element, clazz, on) {
    if (on) {
        element.classList.add(clazz);
    }
    else {
        element.classList.remove(clazz);
    }
}

function handleAmountOrExchangeRateInput() {
    const chfValue = parseFloat(getAmountInput().value) * parseFloat(getExchangeRateInput().value);
    getComputedChfValue().textContent = Number.isNaN(chfValue) ? '' : renderFloat(chfValue);
}

function isDefaultCurrency(currency) {
    return currency === constants.DEFAULT_CURRENCY;
}

function validateDecimalField(decimalField, fractionalDigits) {
    validateField(decimalField, constants.decimalRegex, () => {
        const components = decimalField.value.split('.');
        const integerPart = components[0] ? parseInt(components[0]) : '0';
        const fractionalPart = components[1] ? components[1].substring(0, fractionalDigits).padEnd(fractionalDigits, '0') : '00';
        return integerPart + '.' + fractionalPart;
    });
}

function validateIntegerField(integerField) {
    validateField(integerField, constants.integerRegex, () => parseInt(integerField.value));
}

function validateField(field, regex, prettyPrinter) {
    field.value = field.value.trim();
    if (field.dataset.validatedValue === field.value) {
        return;
    }
    field.classList.remove('error');
    if (!field.value) {
        field.dataset.validatedValue = field.value;
        return;
    }
    if (!regex.test(field.value)) {
        field.dataset.validatedValue = field.value;
        throw new ExpensesError(`'${field.value}' ist keine gültige Zahl`, [field]);
    }
    const validatedValue = prettyPrinter();
    field.value = validatedValue;
    field.dataset.validatedValue = validatedValue;
}

function validateForm() {
    validateDecimalField(getAmountInput(), 2);
    validateDecimalField(getExchangeRateInput(), 5);
    validateIntegerField(getRecurringFrequency());

    const emptyFields = [];
    const mandatoryFields = [getAmountInput(), getExchangeRateInput(), getDescriptionInput()];
    if (getRecurringCheckbox().checked) {
        mandatoryFields.push(
            getRecurringFrequency(),
            getRecurringFrom());
    }
    else {
        mandatoryFields.push(getDateInput());
    }
    mandatoryFields.forEach(f => {
        f.classList.remove('error');
        if (!f.value) {
            f.classList.add('error');
            emptyFields.push(f);
        }
    });

    if (emptyFields.length > 0) {
        let fieldNames = emptyFields
            .map(f => document.querySelector(`label[for="${f.id}"]`).textContent)
            .join(' und ');
        throw new ExpensesError(`Bitte ${fieldNames} ausfüllen`, emptyFields);
    }
}

function removeExpense(id) {
    const index = state.data.expenses.findIndex(e => e.getId() === id);
    state.data.expenses.splice(index, 1);
    state.edit = null;
    setSaved(false);
    save();
    render();
}

function selectExpense(evt) {
    evt.preventDefault();

    state.edit = evt.currentTarget.dataset.xpnsId;
    render();
}

function startNew() {
    state.edit = null;
    state.new = true;
    render();
}

function startLineEdit(id) {
    state.edit = id;
    state.new = false;
    render();
}

function cancelLineEdit() {
    state.edit = null;
    state.new = false;
    render();
}

function getRecurrencePeriodicity() {
    if (!getRecurringCheckbox().checked) {
        return null;
    }
    if (getRecurringMonthly().checked) {
        return 'monthly';
    }
    if (getRecurringYearly().checked) {
        return 'yearly';
    }
}

function submitForm(event) {
    event?.preventDefault();

    validateForm();

    const expense = state.edit ? getEditExpense() : new Expense();
    if (getTypeSelect()) {
        expense.setType(getTypeSelect().value);
    }
    expense.setDate(getDateInput().value);
    expense.setAmount(getAmountInput().value);
    expense.setCurrency(getCurrencySelect().value);
    expense.setExchangeRate(getExchangeRateInput().value);
    expense.setDescription(getDescriptionInput().value);
    expense.setRecurrencePeriodicity(getRecurrencePeriodicity());
    expense.setRecurrenceFrequency(getRecurringFrequency().value);
    expense.setRecurrenceFrom(getRecurringFrom().value);
    if (getRecurringTo().value) {
        expense.setRecurrenceTo(getRecurringTo().value);
    }
    expense.setRecurring(getRecurringCheckbox().checked);

    if (state.edit) {
        state.edit = null;
    }
    else {
        state.new = false;
        state.data.expenses.push(expense);
    }
    setSaved(false);
    if (!expense.isRecurring()) {
        setDate(expense.getDate() || expense.getRecurrenceFrom());
    }
    else {
        render();
    }
    save();
}

function openFile() {
    if (!state.saved && !confirm('Beim Öffnen werden ungespeicherte Änderungen überschrieben. Bist du sicher dass du eine Datei öffnen möchtest?')) {
        return;
    }
    let req = new XMLHttpRequest();
    req.open('get', '/open.php');
    req.responseType = 'json';
    req.addEventListener('load', () => {
        loadExpenses(req.response);
    });
    req.send();
}

function save() {
    let req = new XMLHttpRequest();
    req.open('post', '/save.php');
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        setSaved(true);
        render();
    });
    req.send(JSON.stringify(state.data, null, 2));
}

function setSaved(value) {
    if (state.data.expenses.length === 0) {
        state.saved = true;
        return;
    }
    state.saved = value;
}

function loadExpenses(loadedData) {
    const [isSaveNecessary, migratedData] = Migration.migrate(loadedData);
    state.data.expenses = migratedData.expenses
        .map(obj => {
            const expense = new Expense();
            expense.setId(obj._id);
            expense.setType(obj._type);
            expense.setDate(obj._date);
            expense.setAmount(obj._amount);
            expense.setCurrency(obj._currency);
            expense.setExchangeRate(obj._exchangeRate);
            expense.setDescription(obj._description);
            expense.setCreateDate(obj._createDate);
            expense.setRecurring(obj._recurring);
            expense.setRecurrencePeriodicity(obj._recurrencePeriodicity);
            expense.setRecurrenceFrequency(obj._recurrenceFrequency);
            expense.setRecurrenceFrom(obj._recurrenceFrom);
            expense.setRecurrenceTo(obj._recurrenceTo);
            return expense;
        });
    state.data.categories = loadedData.categories;
    if (isSaveNecessary) {
        save();
    }
    else {
        render();
    }
}

export {
    cancelLineEdit,
    dateToYmd,
    decrementMonth,
    getAmountInput,
    getExchangeRateInput,
    getRecurringFrequency,
    handleAmountOrExchangeRateInput,
    handleCurrencyChanged,
    handleDescriptionBlur,
    handleDescriptionInput,
    handleProposalClick,
    handleProposalSelect,
    handleRecurringCheckboxChanged,
    handleTypeChanged,
    incrementMonth,
    isSameDay,
    openFile,
    validateIntegerField,
    removeExpense,
    render,
    renderDay,
    renderDayHeading,
    renderFloat,
    save,
    setDate,
    setMonthDisplay,
    setSaved,
    setViewMode,
    startLineEdit,
    startNew,
    validateDecimalField
};
