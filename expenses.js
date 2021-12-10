"use strict";

const state = {
    saved: true,
    edit: null,
    selected: null,
    expandedPaths: {},
    monthDisplay: 'chart',
    chartTags: [],
    date: new Date(Date.now()),
    overviewConfiguration: {
        typeFilter: ['income', 'recurring', 'expense']
    },
    proposalSelection: false,
    descriptionCaretPosition: null,
    data: {
        version: 2,
        expenses: [],
        categories: [
            {
                name: 'lebensmittel',
                classes: 'bg-success'
            },
            {
                name: 'kommunikation',
            },
            {
                name: 'zehnt',
                classes: 'bg-light text-dark border'
            },
            {
                name: 'kultur',
                classes: 'bg-warning'
            },
            {
                name: 'haushalt',
                classes: 'bg-dark border'
            },
            {
                name: 'mobilität',
                classes: 'bg-danger'
            },
            {
                name: 'kleidung',
                classes: 'bg-info'
            },
            {
                name: 'gesundheit',
            },
            {
                name: 'geld',
                classes: 'bg-secondary'
            },
            {
                name: 'hobby',
                classes: 'bg-info'
            }
        ],
        tags: [
            {
                name: 'kreditkarte'
            }
        ]
    }
}

const dayHeadingFormat = new Intl.DateTimeFormat([], { weekday: 'long', day: '2-digit', month: '2-digit' });
const dayFormat = new Intl.DateTimeFormat([], { day: 'numeric' });
const monthFormat = new Intl.DateTimeFormat([], { month: 'long', year: 'numeric' });
const numberFormat = new Intl.NumberFormat(['de-CH'], { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimalRegex = /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
const integerRegex = /^([0-9]+)$/;
const tagRegex = /#(\p{Letter}+)\b/ug;
const DEFAULT_CURRENCY = 'CHF';
const defaultExchangeRate = '1.00000';

const today = dateToYmd(new Date(Date.now()));

const typeFilters = {
    income: {
        name: 'Einnahmen',
        filter: ex => ex.getType() === 'income'
    },
    recurring: {
        name: 'Wiederkehrend',
        filter: ex => ex.getType() === 'expense' && ex.isRecurring()
    },
    expense: {
        name: 'Ausgaben',
        filter: ex => ex.getType() === 'expense' && !ex.isRecurring()
    }
}

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
        while (m = tagRegex.exec(this.getDescription())) {
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
    if (e.ctrlKey) {
        if (e.key === 's') {
            save();
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
function getMonth(ymd) {
    return ymd.substring(0, 7);
}

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
        return new Date(date.getFullYear() - 1, 0, date.getDate());
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
function getExpenses() {
    return state.data.expenses;
}

function getCategoryByName(name) {
    const index = state.data.categories.findIndex(c => c.name === name);
    if (index < 0) {
        return null;
    }
    return state.data.categories[index];
}

function setExpenses(newExpenses) {
    state.data.expenses = newExpenses;
}

function setDate(date) {
    state.date = date;
    render();
}

function getCurrentDayString() {
    return dateToYmd(state.date);
}

function getOnetimeExpenses() {
    return getExpenses()
        .filter(e => !e.isRecurring());
}

function getDaysOfMonth(month) {
    let days = {};
    let date = new Date(month.getFullYear(), month.getMonth(), 1);

    const income = getExpenses()
        .filter(e => e.getType() === 'income')
        .filter(e => e.isValidOnDate(new Date(getCurrentDayString())))
        .reduce((sum, e) => sum + e.computeMonthlyAmountChf(), 0);

    const recurringExpenses = getExpenses()
        .filter(e => e.getType() === 'expense')
        .filter(e => e.isRecurring())
        .filter(e => e.isValidOnDate(new Date(getCurrentDayString())))
        .reduce((sum, e) => sum + e.computeMonthlyAmountChf(), 0);

    const availableAmount = income - recurringExpenses;

    while (date.getMonth() === month.getMonth()) {
        days[dateToYmd(date)] = getOnetimeExpenses()
            .filter(e => e.getType() === 'expense' && e.isValidOnDate(date))
            .reduce((day, e) => {
                day.amount += e.computeAmountChf();
                const firstHashPosition = e.getDescription().indexOf('#');
                const dealer = e.getDescription().substr(0, firstHashPosition === -1 ? undefined : firstHashPosition).trim();
                if (!day.description.includes(dealer)) {
                    day.description.push(dealer);
                }
                return day;
            }, { amount: 0, description: [] });
        date.setDate(date.getDate() + 1);
    }

    const numDays = Object.entries(days).length;
    Object.entries(days)
        .filter(entry => new Date(entry[0]) < new Date(today))
        .forEach(entry => {
            entry[1].saved = availableAmount / numDays - entry[1].amount
        });
    return days;
}

function getActiveTypeFilters() {
    return Object.entries(typeFilters)
        .filter(en => state.overviewConfiguration.typeFilter.includes(en[0]));
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
    for (const fd of getActiveTypeFilters()) {
        const childRows = subGroupingFn(rowsFeatured
            .filter(r => r.type === fd[0]))
            .sort((e1, e2) => e2.amountChf - e1.amountChf);

        const amountChf = childRows.reduce((sum, row) => sum += row.amountChf, 0);
        rows.push({
            title: fd[1].name,
            id: fd[0],
            amountChf: amountChf,
            amount: amountChf,
            currency: DEFAULT_CURRENCY,
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
                    currency: DEFAULT_CURRENCY,
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
    const currentDay = new Date(getCurrentDayString());
    const filterDatas = getActiveTypeFilters();
    const filters = filterDatas.map(fd => fd[1].filter);
    const categories = state.data.categories.map(cat => cat.name);

    const rowsFeatured = getExpenses()
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
                for (const category of state.data.categories) {
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

function getComputedChfValue() {
    return document.getElementById('computed-chf-value');
}

function getCurrencySelect() {
    return document.getElementById('currency-input');
}

function getDateInput() {
    return document.getElementById('date-input');
}

function getDayExpensesDiv() {
    return document.getElementById('day-expenses');
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

function getMainArea() {
    return document.getElementById('main-area');
}

function getModificationButtonsForm() {
    return document.getElementById('modification-buttons');
}

function getMonthChart() {
    return document.getElementById('month-chart');
}

function getMonthLabel() {
    return document.getElementById('month-label');
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

function getSaveButton() {
    return document.getElementById('save-button');
}

function getTypeSelect() {
    return document.getElementById('type-select');
}

function renderFloat(f) {
    return numberFormat.format(f);
}

function renderDay(dateString) {
    return dayFormat.format(new Date(dateString));
}

function renderDayHeading(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return dayHeadingFormat.format(date);
}

function decorateTags(description) {
    return description.replaceAll(tagRegex, (m, p0) => {
        const classes = getCategoryByName(p0)?.classes;
        return `<span class="badge ${classes ? classes : 'bg-primary'}">${p0}</span>`
    });
}

function getEditExpense() {
    if (!state.edit) {
        return null;
    }
    const index = getExpenses().findIndex(e => e.getId() === state.edit);
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
    state.selected = null;
    render();
}

function renderMainArea() {
    const items = {
        overview: {
            icon: 'eyeglasses',
            name: 'Übersicht',
            callback: renderMonthOverview
        },
        calendar: {
            icon: 'calendar3',
            name: 'Kalender',
            callback: renderMonthTable
        },
        chart: {
            icon: 'graph-up',
            name: 'Diagramm',
            callback: renderMonthChartTab
        }
    };

    const lis = Object.entries(items)
        .map(en => {
            const [item, props] = en;
            return `
                    <li class="nav-item">
                        <a class="nav-link ${state.monthDisplay === item ? 'active' : ''}" onclick="setMonthDisplay('${item}');" href="#"><i class="bi-${props.icon}"></i> ${props.name}</a>
                    </li>`;
        });

    const content = items[state.monthDisplay].callback();

    getMainArea().innerHTML = `
                <ul class="nav nav-tabs mb-2">
                    ${lis.join('\n')}
                </ul>
                ${content}`;
}

function render() {
    let monthLabel = monthFormat.format(state.date);
    getMonthLabel().textContent = monthLabel;

    renderMainArea();

    renderMonthChart();

    const dayTable = `
                <table class="table table-sm table-hover">
                    ${renderSection(renderDayHeading(state.date), e => e.getType() === 'expense' && !e.isRecurring(), false)}
                </table>`;
    const form = renderForm();
    getDayExpensesDiv().innerHTML = dayTable + form;

    refreshView();

    getSaveButton().disabled = state.saved;
    getExpenseForm().addEventListener('submit', submitForm);

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

    setVisible(getModificationButtonsForm(), !!state.selected);
    getModificationButtonsForm().querySelectorAll('button').forEach(b => b.disabled = !!state.edit);
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

function renderSection(heading, filter, sort) {
    const currentDay = new Date(getCurrentDayString());
    const expenses = getExpenses()
        .filter(filter)
        .filter(ex => ex.isValidOnDate(currentDay));

    if (sort) {
        expenses.sort((e1, e2) => e2.computeMonthlyAmountChf() - e1.computeMonthlyAmountChf());
    }

    const sum = expenses
        .reduce((sum, e) => sum + e.computeMonthlyAmountChf(), 0.0);

    const renderSum = sum > 0.005;

    let section = `
                        <tr class="heading fw-bold">
                            <td>${heading}</td>
                            ${renderAmountTd(renderSum ? renderFloat(sum) : '')}
                            <td></td>
                        </tr>`;

    section += expenses
        .map(e => `
                    <tr data-xpns-id="${e.getId()}" class="${!state.edit ? '' : 'xpns-modal pe-none'} ${state.selected === e.getId() ? 'table-active' : ''}">
                        <td>${decorateTags(e.getDescription())}</td>
                        ${renderAmountTd(renderFloat(e.computeMonthlyAmount()))}
                        <td>${isDefaultCurrency(e.getCurrency()) ? '' : e.getCurrency()}</td>
                    </tr>`)
        .join('\n');

    return section;
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
                    <a href="#" class="btn text-light ${row.ex && row.ex === state.selected ? 'btn-secondary active' : ''}" data-xpns-id="${row.ex || ''}" ${children ? `data-bs-toggle="collapse" data-bs-target="#${childrenId}"` : ''}>
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
                    </div>
                `;
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
        currency: DEFAULT_CURRENCY
    };
}

function renderOverviewSections() {
    const rows = getOverviewData();
    let result = renderOverviewRowsRecursive(rows, '', 0);
    result += renderTopLevelRow(renderRow(computeTotal(rows)));
    return result;
}

function toggleOverviewFilter(filter) {
    const typeFilter = state.overviewConfiguration.typeFilter;
    const numFiltersBefore = typeFilter.length;
    const index = typeFilter.indexOf(filter);
    if (index > -1) {
        typeFilter.splice(index, 1);
    }
    else {
        typeFilter.push(filter);
    }
    render();
}

function renderMonthOverview() {
    const typeFilterButtons = Object.entries(typeFilters)
        .map(en => {
            const [item, props] = en;
            return `
                        <input id="overview-filter-${item}-checkbox" type="checkbox" class="btn-check" onchange="toggleOverviewFilter('${item}')">
                        <label class="btn btn-sm ${state.overviewConfiguration.typeFilter.includes(item) ? 'btn-primary active' : 'btn-outline-primary'}" for="overview-filter-${item}-checkbox">${props.name}</label>`;
        });

    return `
                <form>
                    <div class="btn-group">
                        ${typeFilterButtons.join('\n')}
                    </div>
                </form>
                ${renderOverviewSections()}`;
}

function renderMonthTable() {
    let tableContent = '<table class="table table-sm table-hover">';
    Object.entries(getDaysOfMonth(state.date))
        .forEach(d => {
            const [ymd, row] = d;
            tableContent += `
                        <tr onclick="setDate(new Date('${ymd}'));" ${getCurrentDayString() === ymd ? 'class="table-active"' : ''}>
                            <td class="text-end">${renderDay(ymd)}</td>
                            ${renderAmountTd(row.amount ? renderFloat(row.amount) : '')}
                            <td>${row.description.join(', ')}</td>
                            ${renderAmountTd(row.saved ? renderFloat(row.saved) : '')}
                        </tr>
            `;
        });
    return tableContent + '</table>';
}

function renderMonthChartTab() {
    return `
        <div>
            <canvas id="month-chart"></canvas>
        </div>`;
}

function renderMonthChart() {
    if (state.monthDisplay !== 'chart') {
        return;
    }

    const days = getDaysOfMonth(state.date);

    let savedCumulativeAmount = 0;
    const savedCumulativeData = Object.values(days)
        .map(day => (savedCumulativeAmount += day.saved));
    savedCumulativeData.splice(0, 0, 0);

    const labels = Object.keys(days);
    labels.splice(0, 0, '');

    const expensesData = Object.values(days)
        .map(day => day.amount);
    expensesData.splice(0, 0, 0);

    const isValidDay = function (day) {
        return day > 0 && day <= Object.entries(days).length;
    }

    const isInsideGrid = function (e, chart) {
        return e.y > chart.scales.y.top
            && e.y < chart.scales.y.bottom
            && e.x > chart.scales.x.left
            && e.x < chart.scales.x.right;
    }

    const highlightDay = function (ctx, chart, day, color) {
        if (!day) {
            return;
        }

        ctx.fillStyle = color;

        const xStart = chart.scales.x.getPixelForValue(day - 0.5);
        const xEnd = chart.scales.x.getPixelForValue(day + 0.5);

        const yStart = chart.scales.y.getPixelForValue(chart.scales.y.min);
        const yEnd = chart.scales.y.getPixelForValue(chart.scales.y.max);
        ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
    }

    let hoverDay = null;
    new Chart(getMonthChart(), {
        data: {
            datasets: [
                {
                    type: 'bar',
                    label: 'Ausgaben',
                    data: expensesData,
                    borderColor: 'rgb(255,193,7)',
                    backgroundColor: 'rgb(255,193,7,0.2)',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: 'Gespart kumuliert',
                    data: savedCumulativeData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(108,117,125, 0.05)',
                    tension: 0.25,
                    fill: true
                }
            ],
            labels: labels
        },
        options: {
            animation: false,
            aspectRatio: 1.5,
            color: '#212529',
            scales: {
                x: {
                    min: 0.5,
                    ticks: {
                        callback: function (v) { return this.getLabelForValue(v) === '' ? '' : renderDay(this.getLabelForValue(v)); }
                    }
                }
            },
            onClick(e, activeElements, chart) {
                if (activeElements.length) {
                    const ymd = labels[activeElements[0].index];
                    if (ymd.length === 10) {
                        setDate(new Date(ymd));
                        return;
                    }
                }
                const day = chart.scales.x.getValueForPixel(e.x);
                if (!isValidDay(day)) {
                    return;
                }
                const newDate = new Date(state.date);
                newDate.setDate(day);
                setDate(newDate);
            },
            onHover(e, activeElements, chart) {
                let day = chart.scales.x.getValueForPixel(e.x);
                if (!isValidDay(day) || !isInsideGrid(e, chart)) {
                    day = null;
                }
                if (hoverDay !== day) {
                    hoverDay = day;
                    chart.render();
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${DEFAULT_CURRENCY} ${renderFloat(ctx.dataset.data[ctx.dataIndex])}`,
                        title: ctx => ctx.map(c => renderDayHeading(c.label))
                    }
                }
            }
        },
        plugins: [{
            id: 'custom-canvas-background',
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';

                highlightDay(ctx, chart, state.date.getDate(), 'rgba(0,0,0,0.1)');
                highlightDay(ctx, chart, hoverDay, 'rgba(0,0,0,0.075)');

                ctx.restore();
            }
        }]
    });
}

function getDictionary() {
    return getExpenses()
        .filter(e => e.getType() === getTypeSelect().value)
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
    const expense = getEditExpense();
    const currencies = ['CHF', '€'];
    const defaultCurrency = expense ? isDefaultCurrency(expense.getCurrency()) : true;
    const expenseSelected = !expense || expense.getType() === 'expense';
    let form = `
                <form id="expense-form" autocomplete="off" novalidate>
                    <h2>${state.edit ? 'Bearbeiten' : 'Neu'}</h2>
                    <div class="form-floating mb-3">
                        <select id="type-select" class="form-select" placeholder="Typ" onchange="handleTypeChanged();">
                            <option value="expense" ${expenseSelected ? 'selected' : ''}>Ausgabe</option>
                            <option value="income" ${expense?.getType() === 'income' ? 'selected' : ''}>Einnahme</option>
                            <option value="goal" ${expense?.getType() === 'goal' ? 'selected' : ''}>Sparziel</option>
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
                        <input class="form-control text-end" id="exchange-rate" oninput="handleAmountOrExchangeRateInput();" onchange="validateDecimalField(getExchangeRateInput(), 5);" value="${expense ? expense.getExchangeRate() : defaultExchangeRate}" />
                        <span class="input-group-text">
                            <span id="computed-chf-value">${defaultCurrency ? '0.00' : renderFloat(expense?.computeAmountChf())}</span>
                            <span>&nbsp;${DEFAULT_CURRENCY}</span>
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
                    </div>`;
    const isRecurringToEnabled = expense?.isRecurring() || expense?.getType() === 'goal';
    form += `
                    <div id="recurring-fromto">
                        <label for="recurring-from">Start</label><label id="recurring-fromto-label-sep">/</label><label for="recurring-to">Ende</label>
                        <input id="recurring-from" type="date" value="${expense?.isRecurring() ? dateToYmd(expense.getRecurrenceFrom()) : ''}" />
                        <input id="recurring-to" type="date" value="${expense?.getRecurrenceTo() ? dateToYmd(expense.getRecurrenceTo()) : ''}" />
                    </div>
                    <div class="text-end">
                        ${expense ? `<button class="btn btn-secondary" type="button" title="Abbrechen" onclick="cancelLineEdit();"><i class="bi-x-circle"></i> Abbrechen</button>` : ''}
                        <button class="btn btn-primary" type="submit" title="${expense ? 'Speichern' : 'Hinzufügen'}">${expense ? '<i class="bi-check-circle"></i> Speichern' : '<i class="bi-plus-circle"></i> Hinzufügen'}</button>
                    </div>
                </form>`;

    return form;
}

function getLastExchangeRate(currency, date) {
    const expensesOfDay = getExpenses()
        .filter(e => e.getCurrency() && e.getDate() && isSameDay(e.getDate(), date));
    let relevantExpenses = expensesOfDay;

    if (expensesOfDay.length === 0) {
        const expensesOfCurrency = getExpenses()
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

function refreshView() {
    [getRecurringFrequency(),
    getRecurringMonthly(),
    getRecurringYearly(),
    getRecurringFrequencySep()]
        .forEach(f => setVisible(f, getRecurringCheckbox().checked));

    [getRecurringFrom(),
    getRecurringFromToLabelSep(),
    getRecurringTo()]
        .forEach(f => setVisible(f, getRecurringCheckbox().checked || getTypeSelect().value === 'goal'));

    setVisible(getRecurringCheckbox(), getTypeSelect().value !== 'goal');
    setVisible(getDateInput(), !getRecurringCheckbox().checked && getTypeSelect().value !== 'goal');
    setVisible(document.getElementById('form-line2'), !isDefaultCurrency(getCurrencySelect().value));

    getCurrencySelect().disabled = getTypeSelect().value === 'goal';
}

function handleTypeChanged() {
    if (getTypeSelect().value === 'goal') {
        getRecurringCheckbox().checked = false;
        getCurrencySelect().value = DEFAULT_CURRENCY;
        getExchangeRateInput().value = defaultExchangeRate;
    }
    refreshView();
}

function handleCurrencyChanged() {
    let exchangeRate = defaultExchangeRate;
    if (!isDefaultCurrency(getCurrencySelect().value)) {
        const referenceDate = new Date(getDateInput().value !== '' ? getDateInput().value : getCurrentDayString());
        exchangeRate = getLastExchangeRate(getCurrencySelect().value, referenceDate) || exchangeRate;
    }
    getExchangeRateInput().value = exchangeRate;

    refreshView();
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

    refreshView();
}

function handleAmountOrExchangeRateInput() {
    const chfValue = parseFloat(getAmountInput().value) * parseFloat(getExchangeRateInput().value);
    getComputedChfValue().textContent = Number.isNaN(chfValue) ? '' : renderFloat(chfValue);
}

function isDefaultCurrency(currency) {
    return currency === DEFAULT_CURRENCY;
}

function validateDecimalField(decimalField, fractionalDigits) {
    validateField(decimalField, decimalRegex, () => {
        const components = decimalField.value.split('.');
        const integerPart = components[0] ? parseInt(components[0]) : '0';
        const fractionalPart = components[1] ? components[1].substring(0, fractionalDigits).padEnd(fractionalDigits, '0') : '00';
        return integerPart + '.' + fractionalPart;
    });
}

function validateIntegerField(integerField) {
    validateField(integerField, integerRegex, () => parseInt(integerField.value));
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
    else if (getTypeSelect().value === 'goal') {
        mandatoryFields.push(
            getRecurringFrom(),
            getRecurringTo());
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
    const index = getExpenses().findIndex(e => e.getId() === id);
    getExpenses().splice(index, 1);
    state.selected = null;
    setSaved(false);
    render();
}

function selectExpense(evt) {
    evt.preventDefault();

    state.selected = evt.currentTarget.dataset.xpnsId;
    render();
}

function startLineEdit(id) {
    state.edit = id;
    render();
}

function cancelLineEdit() {
    state.edit = null;
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
        getExpenses().push(expense);
    }

    setSaved(false);
    render();
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
    if (getExpenses().length === 0) {
        state.saved = true;
        return;
    }
    state.saved = value;
}

function loadExpenses(loadedData) {
    const migratedData = migrate(loadedData);
    setExpenses(migratedData.expenses
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
        }));
    render();
}

function migrate(loadedData) {
    if (!loadedData.expenses[0]._id) {
        loadedData.expenses = loadedData.expenses.map(obj => {
            return {
                _id: obj.id,
                _type: 'expense',
                _date: obj.date,
                _amount: obj.amount,
                _currency: obj.currency,
                _exchangeRate: obj.exchangeRate,
                _description: obj.description,
                _createDate: obj.createDate,
                _recurring: obj.recurrence ? true : false,
                _recurrencePeriodicity: obj.recurrence ? obj.recurrence.periodicity : null,
                _recurrenceFrequency: obj.recurrence ? obj.recurrence.frequency : null,
                _recurrenceFrom: obj.recurrence ? obj.recurrence.from : null,
                _recurrenceTo: obj.recurrence ? obj.recurrence.to : null
            };
        });
        state.saved = false;
    }
    return loadedData;
}
