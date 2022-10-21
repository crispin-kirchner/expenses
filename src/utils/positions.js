// TODO Klasse hier draus machen?
import * as PositionType from '../enums/PositionType.js';
import * as dates from './dates.js';

function computeMonthlyAmountChf(pos) {
    return parseFloat(pos.exchangeRate) * computeMonthlyAmount(pos)
}

function computeMonthlyAmount(pos) {
    if (pos.recurring) {
        let amountByFrequency = parseFloat(pos.amount) / pos.recurrenceFrequency;
        if (pos.recurrencePeriodicity === 'monthly') {
            return amountByFrequency;
        }
        if (pos.recurrencePeriodicity === 'yearly') {
            return amountByFrequency / 12;
        }
    }
    return parseFloat(pos.amount);
}

function getSign(pos) {
    return pos.type === PositionType.INCOME ? -1 : 1;
}

function isValidInMonth(pos, month) {
    if (pos.recurring) {
        return dates.isValidInMonth(pos.recurrenceFrom, pos.recurrenceTo, month);
    }
    return dates.isInMonth(pos.date, month);
}

export {
    computeMonthlyAmount,
    computeMonthlyAmountChf,
    getSign,
    isValidInMonth
};
