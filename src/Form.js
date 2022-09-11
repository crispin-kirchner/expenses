import * as App from './App.js';
import * as FormState from './FormState.js';
import * as constants from './constants.js';
import * as currencies from './currencies.js';
import * as dates from './dates.js';
import * as positions from './positions.js';

import ExpensesError from './ExpensesError.js';
import state from './state.js';

function getAmountInput() {
    return document.getElementById('amount');
}

function getCloseButton() {
    return document.getElementById('close-button');
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

function getDeleteButton() {
    return document.getElementById('delete-button');
}

function getDescriptionInput() {
    return document.getElementById('description');
}

function getDescriptionLabel() {
    return App.getLabelByField('description');
}

function getExchangeRateInput() {
    return document.getElementById('exchange-rate');
}

function getExpenseForm() {
    return document.getElementById('expense-form');
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
    setVisible(document.getElementById('form-line2'), !currencies.isDefault(getCurrencySelect().value));

    getDescriptionLabel().textContent = getDescriptionLabelText();
    getDescriptionInput().placeholder = getDescriptionLabelText();
}

function toggleClass(element, clazz, on) {
    if (on) {
        element.classList.add(clazz);
    }
    else {
        element.classList.remove(clazz);
    }
}

function setVisible(field, visible) {
    const elements = [field];
    const label = App.getLabelByField(field.id);
    if (label) {
        elements.push(label);
    }
    elements.forEach(el => toggleClass(el, 'd-none', !visible));
}

function handleTypeChanged() {
    refreshFormView();
}

async function handleCurrencyChanged() {
    let exchangeRate = constants.defaultExchangeRate;
    if (!currencies.isDefault(getCurrencySelect().value)) {
        const referenceDate = new Date(getDateInput().value !== '' ? getDateInput().value : App.getCurrentDayString());
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
    const allPositions = await positions.getAllPositions();
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
    toggleClass(getExpenseForm(), 'dc-active', visible);
}

async function handleDescriptionInput() {
    state.proposalSelection = false;

    const searchString = getDescriptionInput().value;
    const hasText = !!searchString.length;

    if (!hasText) {
        setProposalFieldVisible(false);
        return;
    }
    const dictionary = await getDictionary();
    const proposals = Object.entries(dictionary)
        .filter(e => e[0].toLowerCase().startsWith(searchString.toLowerCase()))
        .sort((a, b) => b[1] - a[1]);

    if (proposals.length === 0) {
        setProposalFieldVisible(false);
        return;
    }

    getProposalField().innerHTML = proposals
        .map((p, i) => `
            <div class="cursor-pointer ${i === 0 ? '' : 'border-top'} px-2 py-1" data-xpns-value="${p[0]}">
                ${App.decorateTags(p[0])}
            </div>`)
        .join('\n');

    getProposalField().querySelectorAll('div')
        .forEach(d => d.addEventListener('click', handleProposalSelect));

    setProposalFieldVisible(true);
}

function handleDescriptionBlur() {
    setProposalFieldVisible(state.proposalSelection);
    state.proposalSelection = false;
}

function handleProposalSelect(evt) {
    getDescriptionInput().value = evt.currentTarget.dataset.xpnsValue;
    handleDescriptionBlur();
    getDescriptionInput().focus();
}

function handleProposalClick() {
    if (!getProposalField().classList.contains('d-none')) {
        state.proposalSelection = true;
    }
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

function handleAmountOrExchangeRateInput() {
    const chfValue = parseFloat(getAmountInput().value) * parseFloat(getExchangeRateInput().value);
    getComputedChfValue().textContent = Number.isNaN(chfValue) ? '' : App.renderFloat(chfValue);
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
            .map(f => App.getLabelByField(f.id).textContent)
            .join(' und ');
        throw new ExpensesError(`Bitte ${fieldNames} ausfüllen`, emptyFields);
    }
}

async function getLastExchangeRate(currency, date) {
    const allPositions = await positions.getAllPositions()
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

async function submit(event) {
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
    positions.setRecurring(position, getRecurringCheckbox().checked);

    state.form = null;
    state.editedPosition.loadState = 'loaded';
    state.editedPosition.data = null;
    if (!position.recurring && !dates.isSameDay(state.date, position.date)) {
        App.setDate(position.date);
    }
    else {
        App.render();
    }
    await positions.storePosition(position);
    App.render();
}

const PositionType = {
    expense: {
        text: 'Ausgabe',
        default: true,
        benefactor: 'Empfänger:in'
    },
    income: {
        text: 'Einnahme',
        default: false,
        benefactor: 'Zahler:in'
    }
};

function getDescriptionLabelText() {
    const type = getTypeSelect()?.value || Object.entries(PositionType).find(e => e[1].default)[0];
    return PositionType[type].benefactor + '/Beschreibung';
}

function render() {
    if (state.form === FormState.EDIT) {
        positions.refreshEditedPosition();
    }
    if (!App.isPositionFormVisible()) {
        return '';
    }

    const position = state.editedPosition.data;
    const isDefaultCurrency = position ? currencies.isDefault(position.currency) : true;

    const typeOptions = Object.entries(PositionType)
        .map(t => `
            <option value="${t[0]}" ${(!position && t[1].default) || position.type === t[0] ? 'selected' : ''}>
                ${t[1].text}
            </option>`)
        .join('\n');

    let form = `
          <div class="col-lg-4 position-absolute end-0 bg-white pt-3 pt-lg-0 mt-lg-content h-100 z-top">
              <form id="expense-form" autocomplete="off" novalidate>
                  <div class="d-flex align-items-center mb-2">
                    <button id="close-button" class="btn" type="button" aria-label="Close"><i class="bi bi-arrow-left"></i></button>
                    <h4 class="me-auto lh-1 mb-0">${state.form === FormState.EDIT ? 'Bearbeiten' : 'Neu'}</h4>
                    ${state.form === FormState.EDIT ? `<button id="delete-button" class="btn btn-outline-danger" type="button" title="Löschen"><i class="bi-trash"></i> <span class="d-lg-none d-xxl-inline-block">Löschen</span></button>` : ''}
                    <button class="btn btn-primary ms-2" type="submit" title="${state.form === FormState.EDIT ? 'Speichern' : 'Hinzufügen'}">
                        <i class="bi-check-circle"></i>
                        <span class="${state.form === FormState.EDIT ? 'd-lg-none d-xxl-inline-block' : ''}">${state.form === FormState.EDIT ? 'Speichern' : 'Hinzufügen'}</span>
                    </button>
                  </div>
                  <div id="controls-container">
                    <div class="form-floating mb-3">
                        <select id="type-select" class="form-select" placeholder="Typ">
                            ${typeOptions}
                        </select>
                        <label for="type-select">Typ</label>
                    </div>
                    <div class="row g-2">
                        <div class="col-8 form-floating">
                            <input id="amount" class="form-control text-end" placeholder="Betrag" inputmode="numeric" value="${position ? position.amount : ''}" />
                            <label for="amount">Betrag</label>
                        </div>
                        <div class="col-4 form-floating">
                            <select id="currency-input" class="form-select" required>
                                ${Object.values(currencies.definitions).map(c => `<option value="${c.id}" ${c.id === position?.currency ? 'selected' : ''}>${c.isoCode}</option>`)}
                            </select>
                            <label for="currency-input">Währung</label>
                        </div>
                    </div>
                    <div id="form-line2" class="input-group mt-2">
                        <span class="input-group-text">Wechselkurs</span>
                        <input class="form-control text-end" id="exchange-rate" inputmode="numeric" value="${position ? position.exchangeRate : constants.defaultExchangeRate}" />
                        <span class="input-group-text">
                            <span id="computed-chf-value">${isDefaultCurrency ? '0.00' : App.renderFloat(positions.computeAmountChf(position))}</span>
                            <span>&nbsp;${currencies.getDefault().displayName}</span>
                        </span>
                    </div>
                    <div id="description-container" class="bg-white">
                        <div class="form-floating mt-3">
                        <input id="description" class="form-control rounded-top" placeholder="${getDescriptionLabelText()}" value="${position ? position.description : ''}" autocomplete="off" />
                        <label for="description">${getDescriptionLabelText()}</label>
                        </div>
                        <div id="proposal-container" class="mb-3">
                            <div id="proposal-field" class="form-select d-none px-0 py-1 overflow-auto border-top-0 rounded-bottom rounded-0" size="4" tabindex="-1">
                            </div>
                        </div>
                    </div>
                    <div class="form-floating">
                        <input id="date-input" class="form-control" type="date" value="${position.date ? dates.toYmd(position.date) : ''}" />
                        <label for="date-input">Datum</label>
                    </div>
                    <div class="form-check form-switch mt-4">
                        <input id="recurring-checkbox" class="form-check-input" type="checkbox" ${position?.recurring ? 'checked' : ''} />
                        <label for="recurring-checkbox" class="form-check-label">Wiederkehrend</label>
                    </div>
                    <div>
                        <input id="recurring-frequency" type="number" class="text-end" size="2" maxlength="2" inputmode="numeric" value="${position?.recurring ? position.recurrenceFrequency : '1'}" /><span id="recurring-frequency-sep">-</span>
                        <input id="recurring-monthly" name="recurring-periodicity" type="radio" ${!position?.recurring || position.recurrencePeriodicity === 'monthly' ? 'checked' : ''} /><label for="recurring-monthly">Monatlich</label>
                        <input id="recurring-yearly" name="recurring-periodicity" type="radio" ${position?.recurrencePeriodicity === 'yearly' ? 'checked' : ''} /><label for="recurring-yearly">Jährlich</label>
                    </div>
                    <div id="recurring-fromto">
                        <label for="recurring-from">Start</label><label id="recurring-fromto-label-sep">/</label><label for="recurring-to">Ende</label>
                        <input id="recurring-from" type="date" value="${position?.recurring ? dates.toYmd(position.recurrenceFrom) : ''}" />
                        <input id="recurring-to" type="date" value="${position?.recurrenceTo ? dates.toYmd(position.recurrenceTo) : ''}" />
                    </div>
                </div>
              </form>
          </div>`;

    return form;
}

function deletePosition() {
    if (window.confirm(`Bist du sicher, dass du diese ${PositionType[getTypeSelect().value].text} löschen möchtest?`)) {
        App.removeExpense(state.editedPosition.data._id);
    }
}

function onAttach() {
    refreshFormView();

    getCloseButton().addEventListener('click', App.cancelLineEdit);
    getDeleteButton()?.addEventListener('click', deletePosition);

    getAmountInput().addEventListener('input', handleAmountOrExchangeRateInput);
    getAmountInput().addEventListener('change', () => validateDecimalField(getAmountInput(), 2));
    getCurrencySelect().addEventListener('change', handleCurrencyChanged);

    getDescriptionInput().addEventListener('input', handleDescriptionInput);
    getDescriptionInput().addEventListener('blur', handleDescriptionBlur);
    getDescriptionInput().addEventListener('mousedown', handleProposalClick);
    getProposalField().addEventListener('blur', handleDescriptionBlur);
    getProposalField().addEventListener('click', handleProposalClick);
    getProposalField().addEventListener('mousedown', handleProposalClick);

    getExpenseForm().addEventListener('submit', submit);
    getRecurringCheckbox().addEventListener('change', handleRecurringCheckboxChanged);
    getTypeSelect().addEventListener('change', handleTypeChanged);
    getExchangeRateInput().addEventListener('input', handleAmountOrExchangeRateInput);
    getExchangeRateInput().addEventListener('change', () => validateDecimalField(getExchangeRateInput(), 5));
    getRecurringFrequency().addEventListener('change', () => validateIntegerField(getRecurringFrequency()));

    getAmountInput().focus();
}

export { render, onAttach, submit, getProposalField, getDescriptionInput };
