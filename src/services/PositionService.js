import * as EntityType from '../enums/EntityType.js';
import * as dates from '../utils/dates.js';
import * as db from './db.js';
import * as positions from '../utils/positions.js';

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

async function loadPosition(id) {
    return docToPosition(await db.getDocument('position', id));
}

async function getAllPositions() {
    return (await db.getAllDocuments(EntityType.POSITION))
        .map(docToPosition);
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

async function storePosition(pos) {
    db.put(positionToDoc(pos));
}

async function getPositionsOfMonth(date) {
    // FIXME use mango query/separate queries for different types
    return (await getAllPositions())
        .filter(ex => positions.isValidInMonth(ex, date));
}

export {
    getDayExpenses,
    getPositionsOfMonth,
    loadPosition,
    storePosition
};
