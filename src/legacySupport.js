import * as dates from './dates.js';
import * as db from './db.js';

import state from './state.js';

function transformLegacyData(loadedData) {
    const transformedData = {};
    transformedData.expenses = loadedData.expenses
        .map(obj => ({
            entity: 'position',

            _id: obj._id,
            type: obj._type,
            date: obj._date ? dates.toYmd(new Date(obj._date)) : null,
            amount: obj._amount,
            currency: obj._currency,
            exchangeRate: obj._exchangeRate,
            description: obj._description,
            createDate: new Date(obj._createDate).toJSON(),
            recurring: obj._recurring,
            recurrencePeriodicity: obj._recurrencePeriodicity,
            recurrenceFrequency: obj._recurrenceFrequency,
            recurrenceFrom: obj._recurrenceFrom ? dates.toYmd(new Date(obj._recurrenceFrom)) : null,
            recurrenceTo: obj._recurrenceTo ? dates.toYmd(new Date(obj._recurrenceTo)) : null
        }));

    transformedData.labels = loadedData.categories
        .map(obj => ({
            entity: 'label',
            _id: obj.name,
            color: obj.color,
            parent: obj.parent
        }));

    return transformedData;
}

function loadJson() {
    return new Promise(resolve => {
        let req = new XMLHttpRequest();
        req.open('get', '/ausgaben_legacy.json');
        req.responseType = 'json';
        req.addEventListener('load', () => {
            resolve(req.response);
        });
        req.send();
    });
}

async function loadLegacyDataIntoPouchDb() {
    const loadedData = await loadJson();
    if (!loadedData) {
        return;
    }
    const transformedData = transformLegacyData(loadedData);
    await db.addMany(transformedData.expenses);
    await db.addMany(transformedData.labels);

    state.dayExpenses.loadState = 'dirty';
    state.daysOfMonth.loadState = 'dirty';
    state.overviewData.loadState = 'dirty';
    state.labels.loadState = 'dirty';
}

export { loadLegacyDataIntoPouchDb };
