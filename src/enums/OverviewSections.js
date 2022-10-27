import * as PositionType from './PositionType.js';

import t from "../utils/texts";

// FIXME remove loadingPlaceholders, orders, remaining
const OverviewSections = {
    INCOME: {
        id: 'INCOME',
        order: 0,
        loadingPlaceholder: 5,
        name: t('Earnings'),
        type: PositionType.INCOME,
        recurringFilter: _ => true
    },
    RECURRING: {
        id: 'RECURRING',
        order: 1,
        loadingPlaceholder: 4,
        name: t('Recurring'),
        type: PositionType.EXPENSE,
        recurringFilter: ex => ex.recurring
    },
    EXPENSE: {
        id: 'EXPENSE',
        order: 2,
        loadingPlaceholder: 3,
        name: t('Expenses'),
        type: PositionType.EXPENSE,
        recurringFilter: ex => !ex.recurring
    },
    REMAINING: {
        id: 'REMAINING',
        order: 3,
        loadingPlaceholder: 4,
        name: t('Remaining')
    }
};

export default OverviewSections;
