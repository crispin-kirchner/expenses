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

async function getAllPositions() {
    return (await db.getAllDocuments('position'))
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

export {
    getDayExpenses
};
