import * as PositionType from '../enums/PositionType.js';
import * as dates from './dates.js';

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

function computeAmountChf(amount, exchangeRate) {
    const amountParsed = parseFloat(amount);
    const exchangeRateParsed = parseFloat(exchangeRate);
    if (isNaN(amountParsed) || isNaN(exchangeRateParsed)) {
        return formatFloat(0.0);
    }
    return formatFloat(parseFloat(exchangeRate) * parseFloat(amount))
}

function isValidInMonth(pos, month) {
    if (pos.recurring) {
        return dates.isValidInMonth(pos.recurrenceFrom, pos.recurrenceTo, month);
    }
    return dates.isInMonth(pos.date, month);
}

export {
    computeAmountChf,
    computeMonthlyAmount,
    computeMonthlyAmountChf,
    getSign,
    isValidInMonth
};
