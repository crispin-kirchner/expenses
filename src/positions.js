import * as PositionType from './PositionType.js';
import * as constants from './constants.js';
import * as currencies from './currencies.js';
import * as dates from './dates.js';
import * as db from './db.js';

import state, { markEverythingDirty, refreshData } from './state.js';

import t from './texts.js';
import { v4 } from 'uuid';

const typeFilters = {
    income: {
        name: t('Earnings'),
        type: PositionType.INCOME,
        recurringFilter: _ => true
    },
    recurring: {
        name: t('Recurring'),
        type: PositionType.EXPENSE,
        recurringFilter: ex => ex.recurring
    },
    expense: {
        name: t('Expenses'),
        type: PositionType.EXPENSE,
        recurringFilter: ex => !ex.recurring
    }
}

function refreshDayExpenses() {
    refreshData('dayExpenses', getDayExpenses);
}

async function getDayExpenses() {
    const all = await getAllPositions();
    const positions = all
        .filter(pos => !pos.recurring && dates.isSameDay(state.date, pos.date));

    const sum = positions
        .reduce((sum, pos) => sum + getSign(pos) * computeMonthlyAmountChf(pos), 0.0);

    return {
        expenses: positions,
        sum: sum
    };
}

function isValidInMonth(pos, month) {
    if (pos.recurring) {
        return dates.isValidInMonth(pos.recurrenceFrom, pos.recurrenceTo, month);
    }
    return dates.isInMonth(pos.date, month);
}

function isValidOnDate(pos, date) {
    if (pos.recurring) {
        return isValidInMonth(pos, date);
    }
    return dates.isSameDay(date, pos.date);
}

function getSign(pos) {
    return pos.type === PositionType.INCOME ? -1 : 1;
}

function computeMonthlyAmountChf(pos) {
    return parseFloat(pos.exchangeRate) * computeMonthlyAmount(pos)
}

function computeAmountChf(pos) {
    if (currencies.isDefault(pos.currency)) {
        return parseFloat(pos.amount);
    }
    return parseFloat(pos.exchangeRate) * parseFloat(pos.amount);
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

function setRecurring(pos, recurring) {
    if (recurring) {
        pos.date = null;
    }
    else {
        pos.recurrencePeriodicity = null;
        pos.recurrenceFrequency = null;
        pos.recurrenceFrom = null;
        pos.recurrenceTo = null;
    }
    pos.recurring = recurring;
}

function prepareCreate() {
    return {
        entity: 'position',

        _id: v4(),
        createDate: new Date(Date.now()),
        type: PositionType.EXPENSE,
        date: state.date,
        amount: '',
        currency: constants.DEFAULT_CURRENCY,
        exchangeRate: constants.defaultExchangeRate,
        description: '',
        recurring: false,
        recurrencePeriodicity: null,
        recurrenceFrequency: null,
        recurrenceFrom: null,
        recurrenceTo: null
    }
}

function docToPosition(doc) {
    doc.date = doc.date ? new Date(doc.date) : null;
    doc.createDate = new Date(doc.createDate);
    doc.recurrenceFrom = doc.recurrenceFrom ? new Date(doc.recurrenceFrom) : null;
    doc.recurrenceTo = doc.recurrenceTo ? new Date(doc.recurrenceTo) : null;
    return doc;
}

function positionToDoc(pos) {
    pos.date = pos.date ? dates.toYmd(pos.date) : null;
    pos.createDate = pos.createDate.toJSON();
    pos.recurrenceFrom = pos.recurrenceFrom ? dates.toYmd(pos.recurrenceFrom) : null;
    pos.recurrenceTo = pos.recurrenceTo ? dates.toYmd(pos.recurrenceTo) : null;
    return pos;
}

function storePosition(pos) {
    markEverythingDirty();
    return db.put(positionToDoc(pos));
}

function deletePosition(pos) {
    markEverythingDirty();
    return db.remove(positionToDoc(pos));
}

async function getAllPositions() {
    return (await db.getAllDocuments('position'))
        .map(docToPosition);
}

async function getPosition(id) {
    return docToPosition(await db.getDocument('position', id));
}

function refreshDaysOfMonth() {
    refreshData('daysOfMonth', getDaysOfMonth);
}

async function getDaysOfMonth() {
    const all = await getAllPositions();

    const income = all
        .filter(e => e.type === PositionType.INCOME)
        .filter(e => isValidInMonth(e, state.date))
        .reduce((sum, e) => sum + computeMonthlyAmountChf(e), 0);

    const recurringExpenses = all
        .filter(e => e.type === PositionType.EXPENSE)
        .filter(e => e.recurring)
        .filter(e => isValidOnDate(e, state.date))
        .reduce((sum, e) => sum + computeMonthlyAmountChf(e), 0);

    const availableAmount = income - recurringExpenses;
    const onetimeExpenses = all.filter(e => !e.recurring && e.type === PositionType.EXPENSE);

    const days = {};
    let hasExpenses = false;
    let date = dates.getFirstDayOfMonth(state.date);
    while (date.getMonth() === state.date.getMonth()) {
        const day = onetimeExpenses
            .filter(e => isValidOnDate(e, date))
            .reduce((day, e) => {
                hasExpenses = true;
                day.amount += computeAmountChf(e);
                const firstHashPosition = e.description.indexOf('#');
                const dealer = e.description.substr(0, firstHashPosition === -1 ? undefined : firstHashPosition).trim();
                if (!day.description.includes(dealer)) {
                    day.description.push(dealer);
                }
                return day;
            }, { amount: 0, description: [] });

        day.index = date.getDate();
        days[dates.toYmd(date)] = day;

        date.setDate(date.getDate() + 1);
    }
    if (!hasExpenses) {
        return {};
    }

    const entries = Object.entries(days);
    const numDays = entries.length;
    entries
        .filter(([ymd, _]) => new Date(ymd) <= constants.today)
        .forEach(([_, day]) => day.saved = availableAmount / numDays - day.amount);

    return days;
}

function groupByType(rowsFeatured, subGroupingFn) {
    const rows = [];
    for (const fd of Object.entries(typeFilters)) {
        const childRows = subGroupingFn(rowsFeatured
            .filter(r => r.type === fd[0]))
            .sort((e1, e2) => e2.amountChf - e1.amountChf);

        const amountChf = childRows.reduce((sum, row) => sum += row.amountChf, 0);
        rows.push({
            title: fd[1].name,
            id: fd[0],
            amountChf: amountChf,
            amount: amountChf,
            type: fd[1].type,
            currency: constants.DEFAULT_CURRENCY,
            childRows: childRows
        });
    }
    return rows;
}

function groupByCategory(rowsFeatured) {
    return rowsFeatured
        .reduce((outRows, row) => {
            if (!row.category) {
                outRows.push(row);
                return outRows;
            }
            const index = outRows.findIndex(outRow => outRow.id === row.category);
            let outRow = null;
            if (index < 0) {
                outRow = {
                    title: row.category,
                    id: row.category,
                    amountChf: 0,
                    amount: 0,
                    type: row.type,
                    currency: constants.DEFAULT_CURRENCY,
                    category: row.category,
                    childRows: []
                };
                outRows.push(outRow);
            }
            else {
                outRow = outRows[index];
            }
            outRow.amountChf += row.amountChf;
            outRow.amount += row.amountChf;
            outRow.childRows.push(row);
            row.title = row.title.replace(new RegExp(`\\s#${row.category}(?:\\b|$)`), '');
            return outRows;
        }, [])
        .map(or => {
            or.childRows.sort((e1, e2) => e2.amountChf - e1.amountChf);
            return or;
        })
        .sort((e1, e2) => e2.amountChf - e1.amountChf);
}

function refreshOverviewData() {
    refreshData('overviewData', getOverviewData);
}

function visitOverviewDataRecursive(row, visitor, path) {
    if (visitor(row, path) !== 'continue') {
        return;
    }
    for (const childRow of row.childRows) {
        visitOverviewDataRecursive(childRow, visitor, [...path, row]);
    }
}

function visitOverviewData(visitor) {
    state.overviewData.data
        .forEach(r => visitOverviewDataRecursive(r, visitor, []));
}

function getLabels(position) {
    let m = null;
    const labels = [];
    while ((m = constants.labelRegex.exec(position.description))) {
        labels.push(m[1]);
    }
    return labels;
}

function refreshEditedPosition() {
    refreshData('editedPosition', () => getPosition(state.editedPosition.data._id));
}

function hasLabel(position, labelName) {
    return getLabels(position).includes(labelName);
}

function getType(pos) {
    const matchingFilter = Object.entries(typeFilters)
        .find(fd => pos.type === fd[1].type && fd[1].recurringFilter(pos));

    return matchingFilter[0];
}

function getLabel(pos) {
    const standardLabels = state.labels.data.flat
        .filter(c => c.parent === constants.standardDimension);

    for (const label of standardLabels) {
        if (hasLabel(pos, label._id)) {
            return label._id;
        }
    }
}

function refreshSearchData() {
    refreshData('searchData', getSearchData, true);
}

async function getSearchData() {
    const searchString = state.searchString.trim();
    if (!searchString || searchString.length < 3) {
        return;
    }

    const result = await db.queryDescription({
        selector: {
            entity: 'position',
            recurring: false,
            description: { $regex: new RegExp(`.*${searchString}.*`, 'i') }
        }
    });

    return result.docs.reduce((acc, doc) => {
        const year = doc.date.substring(0, 4);
        const yearObj = (acc[year] = acc[year] || { total: 0, months: {} });

        const month = doc.date.substring(5, 7);
        const monthObj = (yearObj.months[month] = yearObj.months[month] || { total: 0, docs: [] });

        const amountChf = computeAmountChf(doc);
        const sign = getSign(doc);
        yearObj.total += sign * amountChf;
        monthObj.total += sign * amountChf;
        monthObj.docs.push(doc);

        return acc;
    }, {});
}

function computeRemainderRow(rowsGrouped) {
    const remainder = rowsGrouped
        .reduce((sum, row) => row.id === PositionType.INCOME
            ? sum + row.amount
            : sum - row.amount, 0);

    return {
        title: t('Remaining'),
        amount: remainder,
        amountChf: remainder,
        currency: constants.DEFAULT_CURRENCY,
        childRows: []
    };
}

async function getOverviewData() {
    const currentDay = state.date;

    const rowsFeatured = (await getAllPositions())
        .filter(ex => isValidInMonth(ex, currentDay))
        .map(pos => ({
            ex: pos._id,
            title: pos.description,
            amountChf: computeMonthlyAmountChf(pos),
            amount: computeMonthlyAmount(pos),
            currency: pos.currency,
            type: getType(pos),
            category: getLabel(pos),
            childRows: []
        }));

    const rowsGrouped = groupByType(rowsFeatured, groupByCategory);
    rowsGrouped.push(computeRemainderRow(rowsGrouped));

    return rowsGrouped;
}

export {
    prepareCreate,
    getAllPositions,
    getLabels,
    getPosition,
    refreshDaysOfMonth,
    refreshDayExpenses,
    refreshEditedPosition,
    computeMonthlyAmount,
    refreshOverviewData,
    setRecurring,
    computeAmountChf,
    storePosition,
    deletePosition,
    refreshSearchData,
    visitOverviewData
};
