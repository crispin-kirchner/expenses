import * as dates from '../utils/dates.js';
import * as db from './db.js';
import * as positions from '../utils/positions.js';

import EntityType from '../enums/EntityType.js';

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

function storePosition(pos) {
    db.put(positionToDoc(pos));
}

// TODO versuchen, nur ID und REV zu senden
function deletePosition(pos) {
    return db.remove(positionToDoc(pos));
}

async function getPositionsOfMonth(date) {
    // FIXME use mango query/separate queries for different types
    return (await getAllPositions())
        .filter(ex => positions.isValidInMonth(ex, date));
}

export {
    getPositionsOfMonth,
    loadPosition,
    storePosition,
    deletePosition
};
