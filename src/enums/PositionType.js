import t from '../utils/texts.js';

const INCOME = 'income';
const EXPENSE = 'expense';

const defs = {};

defs[INCOME] = {
    text: t('Earning'),
    thisText: t('ThisEarning'),
    default: false,
    benefactor: t('Payer')
};

defs[EXPENSE] = {
    text: t('Expense'),
    thisText: t('ThisExpense'),
    default: true,
    benefactor: t('Beneficiary')
};

export { INCOME, EXPENSE, defs };
