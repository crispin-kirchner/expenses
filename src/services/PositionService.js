import * as EntityType from '../enums/EntityType.js';
import * as PositionType from '../enums/PositionType.js';
import * as dates from '../utils/dates.js';
import * as db from './db.js';
import * as positions from '../utils/positions.js';

import { DEFAULT_EXCHANGE_RATE, getDefaultCurrency } from '../enums/currencies.js';

import OverviewSections from '../enums/OverviewSections.js';
import { getRootTag } from '../utils/tags.js';

function docToPosition(doc) {
    doc.date = doc.date ? new Date(doc.date) : null;
    doc.createDate = new Date(doc.createDate);
    doc.recurrenceFrom = doc.recurrenceFrom ? new Date(doc.recurrenceFrom) : null;
    doc.recurrenceTo = doc.recurrenceTo ? new Date(doc.recurrenceTo) : null;
    return doc;
}

async function loadPosition(id) {
    return docToPosition(await db.getDocument('position', id));
}

async function getAllPositions() {
    return (await db.getAllDocuments(EntityType.POSITION))
        .map(docToPosition);
}

function getTypeFilters() {
    return Object.values(OverviewSections)
        .filter(fd => fd.type && fd.recurringFilter);
}

// TODO 1. ganzen Monat anzeigen
// TODO 2. gezielt queryen
async function getDayExpenses(date) {
    const all = await getAllPositions();
    const dayPositions = all
        .filter(pos => !pos.recurring && dates.isSameDay(date, pos.date));

    const sum = dayPositions
        .reduce((sum, pos) => sum + positions.getSign(pos) * positions.computeMonthlyAmountChf(pos), 0.0);

    return {
        expenses: dayPositions,
        sum: sum
    };
}

function groupBySection(rowsFeatured, subGroupingFn) {
    const sections = {};
    for (const fd of getTypeFilters()) {
        const childRows = subGroupingFn(rowsFeatured
            .filter(r => r.type === fd.id))
            .sort((e1, e2) => e2.amountChf - e1.amountChf);

        const amountChf = childRows.reduce((sum, row) => sum += row.amountChf, 0);
        sections[fd.id] = {
            description: fd.name,
            _id: fd.id,
            amountChf: amountChf,
            amount: amountChf,
            type: fd.type,
            currency: getDefaultCurrency().id,
            childRows: childRows
        };
    }
    return sections;
}

function groupByCategory(rowsFeatured) {
    return rowsFeatured
        .reduce((outRows, row) => {
            if (!row.category) {
                outRows.push(row);
                return outRows;
            }
            const index = outRows.findIndex(outRow => outRow._id === row.category);
            let outRow = null;
            if (index < 0) {
                outRow = {
                    _id: row.category,
                    description: '#' + row.category,
                    amountChf: 0,
                    amount: 0,
                    type: row.type,
                    currency: getDefaultCurrency().id,
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
            row.description = row.description.replace(new RegExp(`\\s#${row.category}(?:\\b|$)`), '');
            return outRows;
        }, [])
        .map(or => {
            or.childRows.sort((e1, e2) => e2.amountChf - e1.amountChf);
            return or;
        })
        .sort((e1, e2) => e2.amountChf - e1.amountChf);
}

function getType(pos) {
    const matchingFilter = getTypeFilters()
        .find(fd => pos.type === fd.type && fd.recurringFilter(pos));

    return matchingFilter.id;
}

function computeRemainderRow(rowsGrouped) {
    const remainder = Object.values(rowsGrouped)
        .reduce((sum, row) => row.type === PositionType.INCOME
            ? sum + row.amount
            : sum - row.amount, 0);

    return {
        description: OverviewSections.REMAINING.name,
        _id: OverviewSections.REMAINING.id,
        amount: remainder,
        amountChf: remainder,
        currency: getDefaultCurrency().id,
        childRows: []
    };
}

// TODO move to overview component, implement with lodash
async function getOverviewData(currentDay, tags) {
    if (!tags) {
        return null;
    }
    const rowsFeatured = (await getAllPositions())
        .filter(ex => positions.isValidInMonth(ex, currentDay))
        .map(pos => ({
            _id: pos._id,
            description: pos.description,
            amountChf: positions.computeMonthlyAmountChf(pos),
            amount: positions.computeMonthlyAmount(pos),
            currency: pos.currency,
            type: getType(pos),
            category: getRootTag(pos.description, tags.flat), // getLabel(pos) FIXME implement together with label hierarchy
            childRows: []
        }));

    const rowsGrouped = groupBySection(rowsFeatured, groupByCategory);
    rowsGrouped[OverviewSections.REMAINING.id] = computeRemainderRow(rowsGrouped);

    return rowsGrouped;
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
    getDayExpenses,
    getOverviewData,
    createEmptyPosition,
    loadPosition
};
