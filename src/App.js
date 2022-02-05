import * as Calendar from './Calendar.js';
import * as ManageTags from './ManageTags.js';
import * as MonthChart from './MonthChart.js';
import * as Navbar from './Navbar.js';
import * as Overview from './Overview.js';
import * as constants from './constants.js';
import * as dates from './dates.js';
import * as db from './db.js';
import * as expenses from './expenses.js';
import * as labels from './labels.js';
import * as legacySupport from './legacySupport.js';

import state, { refreshData } from './state.js';

import ExpensesError from './ExpensesError.js';

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
    if (e.key === 'Insert') {
      startNew();
      return false;
    }
  }
  if ((e.target.id === 'description' && e.key === 'ArrowDown') || e.key === 'ArrowUp') {
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
 * Data store
 */
function setDate(date) {
  if (dates.isSameDay(date, state.date)) {
    return;
  }
  if (!dates.isSameMonth(date, state.date)) {
    state.daysOfMonth.loadState = 'dirty';
    state.overviewData.loadState = 'dirty';
  }
  state.dayExpenses.loadState = 'dirty';
  state.date = date;
  render();
}

function getCurrentDayString() {
  return dates.toYmd(state.date);
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
  return constants.dayFormat.format(date);
}

function renderDayHeading(date) {
  return constants.dayHeadingFormat.format(date);
}

function decorateTags(description) {
  return description.replaceAll(constants.labelRegex, (_, p0) => labels.render(p0));
}

function renderAmountTd(content) {
  return `<td class="text-end">${content}</td>`;
}

function setMonthDisplay(monthDisplay) {
  if (monthDisplay === state.monthDisplay) {
    return;
  }
  state.monthDisplay = monthDisplay;
  localStorage.setItem('monthDisplay', monthDisplay);
  render();
}

function setViewMode(viewMode) {
  state.form = null;
  state.viewMode = viewMode;
  render();
}

function renderMainArea() {
  const items = {
    overview: {
      icon: 'eyeglasses',
      name: 'Übersicht',
      callback: Overview.render
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
  labels.refresh();
  getNavbar().innerHTML = Navbar.render();
  Navbar.onAttach();

  let appArea;
  let expenseForm;
  if (state.viewMode === 'monthDisplay') {
    const mainArea = renderMainArea();
    const dayTable = renderDayExpenses();
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

function renderDayExpenses() {
  expenses.refreshDayExpenses();

  const renderSum = state.dayExpenses.data.sum > 0.005;

  let rows = `
        <div id="day-expenses" class="col-lg-4 mt-lg-content">
            <nav class="nav border-bottom border-top"><span class="nav-link px-0 me-auto">${renderDayHeading(state.date)}</span><span class="nav-link px-2">${renderSum ? renderFloat(state.dayExpenses.data.sum) : ''}</span></nav>
            <table class="table table-sm table-hover">`;
  rows += state.dayExpenses.data.expenses
    .map(e => `
            <tr data-xpns-id="${e._id}">
                <td class="text-nowrap">${decorateTags(e.description)}</td>
                ${renderAmountTd(renderFloat(expenses.computeMonthlyAmount(e)))}
                <td>${isDefaultCurrency(e.currency) ? '' : e.currency}</td>
            </tr>`)
    .join('\n');
  rows += `</table>
        </div>`;

  return rows;
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

async function handleCurrencyChanged() {
  let exchangeRate = constants.defaultExchangeRate;
  if (!isDefaultCurrency(getCurrencySelect().value)) {
    const referenceDate = new Date(getDateInput().value !== '' ? getDateInput().value : getCurrentDayString());
    exchangeRate = (await getLastExchangeRate(getCurrencySelect().value, referenceDate)) || exchangeRate;
    getExchangeRateInput().value = exchangeRate;
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

async function getDictionary() {
  const allPositions = await expenses.getAllPositions();
  return allPositions
    .map(e => e.description)
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

async function handleDescriptionInput() {
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
    const dictionary = await getDictionary();
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

function refreshEditedPosition() {
  refreshData('editedPosition', () => expenses.getPosition(state.editedPosition.data._id));
}

function renderForm() {
  if (state.form === 'edit') {
    refreshEditedPosition();
  }
  if (!state.form || state.editedPosition.loadState !== 'loaded') {
    return '';
  }

  const position = state.editedPosition.data;
  const currencies = ['CHF', '€'];
  const defaultCurrency = position ? isDefaultCurrency(position.currency) : true;
  const isExpense = !position || position.type === 'expense';
  let form = `
        <div class="col-lg-4 position-absolute end-0 bg-white pt-3 pt-lg-0 mt-lg-content h-100 z-top">
            <form id="expense-form" autocomplete="off" novalidate>
                <div class="d-flex align-items-center mb-2">
                    <h2 class="me-auto">${state.form === 'edit' ? 'Bearbeiten' : 'Neu'}</h2>
                    <button type="button" class="btn-close" aria-label="Close" onclick="cancelLineEdit();"></button>
                </div>
                <div class="form-floating mb-3">
                    <select id="type-select" class="form-select" placeholder="Typ" onchange="handleTypeChanged();">
                        <option value="expense" ${isExpense ? 'selected' : ''}>Ausgabe</option>
                        <option value="income" ${position?.type === 'income' ? 'selected' : ''}>Einnahme</option>
                    </select>
                    <label for="type-select">Typ</label>
                </div>
                <div class="form-floating">
                    <input id="description" class="form-control rounded-top" placeholder="Beschreibung" value="${position ? position.description : ''}" oninput="handleDescriptionInput()" onmousedown="handleProposalClick()" onblur="handleDescriptionBlur()" />
                    <label for="description">Beschreibung</label>
                </div>
                <div class="mb-3">
                    <select id="proposal-field" class="form-select d-none overflow-auto border-top-0 rounded-bottom rounded-0" size="4" tabindex="-1" onchange="handleProposalSelect()" onmousedown="handleProposalClick()" onblur="handleDescriptionBlur()">
                    </select>
                </div>
                <div class="row g-2">
                    <div class="col-8 form-floating">
                        <input id="amount" class="form-control text-end" placeholder="Betrag" oninput="handleAmountOrExchangeRateInput();" onchange="validateDecimalField(getAmountInput(), 2);" value="${position ? position.amount : ''}" />
                        <label for="amount">Betrag</label>
                    </div>
                    <div class="col-4 form-floating">
                        <select id="currency-input" class="form-select" onchange="handleCurrencyChanged()" required>
                            ${currencies.map(c => `<option value="${c}" ${c === position?.currency ? 'selected' : ''}>${c}</option>`)}
                        </select>
                        <label for="currency-input">Währung</label>
                    </div>
                </div>
                <div id="form-line2" class="input-group mt-2">
                    <span class="input-group-text">Wechselkurs</span>
                    <input class="form-control text-end" id="exchange-rate" oninput="handleAmountOrExchangeRateInput();" onchange="validateDecimalField(getExchangeRateInput(), 5);" value="${position ? position.exchangeRate : constants.defaultExchangeRate}" />
                    <span class="input-group-text">
                        <span id="computed-chf-value">${defaultCurrency ? '0.00' : renderFloat(expenses.computeAmountChf(position))}</span>
                        <span>&nbsp;${constants.DEFAULT_CURRENCY}</span>
                    </span>
                </div>
                <div class="form-floating mt-3">
                    <input id="date-input" class="form-control" type="date" value="${position.date ? dates.toYmd(position.date) : ''}" />
                    <label for="date-input">Datum</label>
                </div>
                <div class="form-check form-switch mt-4">
                    <input id="recurring-checkbox" class="form-check-input" type="checkbox" onchange="handleRecurringCheckboxChanged();" ${position?.recurring ? 'checked' : ''} />
                    <label for="recurring-checkbox" class="form-check-label">Wiederkehrend</label>
                </div>
                <div>
                    <input id="recurring-frequency" type="number" class="text-end" size="2" maxlength="2" value="${position?.recurring ? position.recurrenceFrequency : '1'}" onchange="validateIntegerField(getRecurringFrequency());" /><span id="recurring-frequency-sep">-</span>
                    <input id="recurring-monthly" name="recurring-periodicity" type="radio" ${!position?.recurring || position.recurrencePeriodicity === 'monthly' ? 'checked' : ''} /><label for="recurring-monthly">Monatlich</label>
                    <input id="recurring-yearly" name="recurring-periodicity" type="radio" ${position?.recurrencePeriodicity === 'yearly' ? 'checked' : ''} /><label for="recurring-yearly">Jährlich</label>
                </div>
                <div id="recurring-fromto">
                    <label for="recurring-from">Start</label><label id="recurring-fromto-label-sep">/</label><label for="recurring-to">Ende</label>
                    <input id="recurring-from" type="date" value="${position?.recurring ? dates.toYmd(position.recurrenceFrom) : ''}" />
                    <input id="recurring-to" type="date" value="${position?.recurrenceTo ? dates.toYmd(position.recurrenceTo) : ''}" />
                </div>
                <div class="d-flex mt-4">
                    ${state.form === 'edit' ? `<button class="btn btn-secondary" type="button" title="Löschen" onclick="removeExpense(state.editedPosition.data._id);"><i class="bi-trash"></i> Löschen</button>` : ''}
                    <button class="btn btn-primary ms-auto" type="submit" title="${state.form === 'edit' ? 'Speichern' : 'Hinzufügen'}">${state.form === 'edit' ? '<i class="bi-check-circle"></i> Speichern' : '<i class="bi-plus-circle"></i> Hinzufügen'}</button>
                </div>
            </form>
        </div>`;

  return form;
}

async function getLastExchangeRate(currency, date) {
  const allPositions = await expenses.getAllPositions()
  const expensesOfDay = allPositions
    .filter(e => e.currency && e.date && dates.isSameDay(e.date, date));
  let relevantExpenses = expensesOfDay;

  if (expensesOfDay.length === 0) {
    const expensesOfCurrency = allPositions
      .filter(e => e.type === 'expense' && e.currency === getCurrencySelect().value);

    if (expensesOfCurrency.length === 0) {
      return null;
    }
    relevantExpenses = expensesOfCurrency;
  }

  return relevantExpenses
    .reduce((latest, e) => e.createDate > latest.createDate ? e : latest)
    .exchangeRate;
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

function selectExpense(evt) {
  evt.preventDefault();

  startEditPosition(evt.currentTarget.dataset.xpnsId);
}

function startNew() {
  state.form = 'new';
  state.editedPosition.data = expenses.prepareCreate();
  state.editedPosition.loadState = 'loaded';
  render();
}

function startEditPosition(id) {
  state.form = 'edit';
  state.editedPosition.data = { _id: id };
  state.editedPosition.loadState = 'dirty';
  render();
}

function cancelLineEdit() {
  state.form = null;
  state.editedPosition.loadState = 'loaded';
  state.editedPosition.data = null;
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

async function submitForm(event) {
  event?.preventDefault();

  validateForm();

  const position = state.editedPosition.data;
  position.type = getTypeSelect().value;
  position.date = new Date(getDateInput().value);
  position.amount = getAmountInput().value;
  position.currency = getCurrencySelect().value;
  position.exchangeRate = getExchangeRateInput().value;
  position.description = getDescriptionInput().value;
  position.recurrencePeriodicity = getRecurrencePeriodicity();
  position.recurrenceFrequency = parseInt(getRecurringFrequency().value);
  position.recurrenceFrom = new Date(getRecurringFrom().value);
  if (getRecurringTo().value) {
    position.recurrenceTo = new Date(getRecurringTo().value);
  }
  expenses.setRecurring(position, getRecurringCheckbox().checked);

  state.form = null;
  state.editedPosition.loadState = 'loaded';
  state.editedPosition.data = null;
  if (!position.recurring && !dates.isSameDay(state.date, position.date)) {
    setDate(position.date);
  }
  else {
    render();
  }
  await expenses.storePosition(position);
  render();
}

async function removeExpense() {
  await expenses.deletePosition(state.editedPosition.data);

  state.form = null;
  state.editedPosition.loadState = 'loaded';
  state.editedPosition.data = null;
  render();
}

window.onerror = (msg, url, lineNo, columnNo, error) => {
  if (error instanceof ExpensesError) {
    error.origins.forEach(o => o.classList.add('error'))
    alert(error.message);
    return;
  }
  throw error;
};

async function onAttach() {
  window.setMonthDisplay = setMonthDisplay;
  window.cancelLineEdit = cancelLineEdit;
  window.startNew = startNew;
  window.removeExpense = removeExpense;
  window.handleDescriptionInput = handleDescriptionInput;
  window.handleProposalClick = handleProposalClick;
  window.handleDescriptionBlur = handleDescriptionBlur;
  window.handleProposalSelect = handleProposalSelect;
  window.handleAmountOrExchangeRateInput = handleAmountOrExchangeRateInput;
  window.validateDecimalField = validateDecimalField;
  window.getAmountInput = getAmountInput;
  window.handleCurrencyChanged = handleCurrencyChanged;
  window.handleRecurringCheckboxChanged = handleRecurringCheckboxChanged;
  window.handleTypeChanged = handleTypeChanged;
  window.validateIntegerField = validateIntegerField;
  window.getExchangeRateInput = getExchangeRateInput;
  window.getRecurringFrequency = getRecurringFrequency;

  window.state = state;

  render();
  if (await db.isEmpty()) {
    await legacySupport.loadLegacyDataIntoPouchDb();
    render();
  }
}

export {
  cancelLineEdit,
  decorateTags,
  getAmountInput,
  getCurrentDayString,
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
  isDefaultCurrency,
  validateIntegerField,
  removeExpense,
  render,
  renderDay,
  renderDayHeading,
  renderFloat,
  setDate,
  setMonthDisplay,
  setViewMode,
  startEditPosition,
  startNew,
  validateDecimalField,
  onAttach
};
