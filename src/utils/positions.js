import * as PositionType from '../enums/PositionType.js';

function getSign(pos) {
    return pos.type === PositionType.INCOME ? -1 : 1;
}

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

export {
    computeMonthlyAmount,
    computeMonthlyAmountChf,
    getSign
};
