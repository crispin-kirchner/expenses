import * as PositionType from './PositionType.js';

import t from "../utils/texts";

const OverviewSections = {
    INCOME: {
        id: 'INCOME',
        name: t('Earnings'),
        type: PositionType.INCOME,
        recurringFilter: _ => true
    },
    RECURRING: {
        id: 'RECURRING',
        name: t('Recurring'),
        type: PositionType.EXPENSE,
        recurringFilter: ex => ex.recurring
    },
    EXPENSE: {
        id: 'EXPENSE',
        name: t('Expenses'),
        type: PositionType.EXPENSE,
        recurringFilter: ex => !ex.recurring
    },
    SAVED: {
        id: 'SAVED',
        name: t('Saved')
    },
    REMAINING: {
        id: 'REMAINING',
        name: t('Remaining')
    }
};

export default OverviewSections;
