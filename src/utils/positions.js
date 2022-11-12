import * as PositionType from '../enums/PositionType.js';
import * as dates from './dates.js';

import { DEFAULT_EXCHANGE_RATE, getDefaultCurrency } from '../enums/currencies.js';

import RecurrencePeriodicity from '../enums/RecurrencePeriodicity.js';
import { formatFloat } from './formats.js';

function computeMonthlyAmountChf(pos) {
    return parseFloat(pos.exchangeRate) * computeMonthlyAmount(pos)
}

function computeMonthlyAmount(pos) {
    if (pos.recurring) {
        let amountByFrequency = parseFloat(pos.amount) / pos.recurrenceFrequency;
        if (pos.recurrencePeriodicity === RecurrencePeriodicity.MONTHLY) {
            return amountByFrequency;
        }
        if (pos.recurrencePeriodicity === RecurrencePeriodicity.YEARLY) {
            return amountByFrequency / 12;
        }
    }
    return parseFloat(pos.amount);
}

function getSign(pos) {
    return pos.type === PositionType.INCOME ? -1 : 1;
}

// FIXME gucken ob die internationalen Zahlen richtig formatiert werden
function computeAmountChf(amount, exchangeRate) {
    if (isNaN(amount) || isNaN(exchangeRate)) {
        return formatFloat(0.0);
    }
    return formatFloat(exchangeRate * amount);
}

function isValidInMonth(pos, month) {
    if (pos.recurring) {
        return dates.isValidInMonth(pos.recurrenceFrom, pos.recurrenceTo, month);
    }
    return dates.isInMonth(pos.date, month);
}

function createEmptyPosition(date) {
    return {
        entity: 'position',

        _id: null, // FIXME uuid lösen wenn gespeichert wird
        createDate: new Date(Date.now()),
        type: PositionType.EXPENSE,
        date: date,
        amount: '',
        currency: getDefaultCurrency().id,
        exchangeRate: DEFAULT_EXCHANGE_RATE,
        description: '',
        recurring: false,
        recurrencePeriodicity: null,
        recurrenceFrequency: null,
        recurrenceFrom: null,
        recurrenceTo: null
    }
}

export {
    computeAmountChf,
    computeMonthlyAmount,
    computeMonthlyAmountChf,
    createEmptyPosition,
    getSign,
    isValidInMonth
};
