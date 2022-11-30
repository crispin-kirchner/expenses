import * as dates from '../utils/dates.js';
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

async function loadPosition(db, id) {
    return docToPosition(await db.getDocument('position', id));
}

async function getAllPositions(db) {
    return (await db.getAllDocuments(EntityType.POSITION))
        .map(docToPosition);
}

function storePosition(db, pos) {
    return db.put(positionToDoc(pos));
}

function deletePosition(db, pos) {
    return db.remove(positionToDoc(pos));
}

async function getPositionsOfMonth(db, date) {
    const allDocuments = (await getAllPositions(db))
        .filter(d => positions.isValidInMonth(d, date));
    return allDocuments;
}

export {
    getPositionsOfMonth,
    loadPosition,
    storePosition,
    deletePosition
};
