import * as UnsyncedDocuments from './UnsyncedDocuments.js';
import * as currencies from './currencies.js';
import * as db from './db.js';

const currencyIdsByDisplayName = {};
Object.values(currencies.definitions).forEach(def => currencyIdsByDisplayName[def.displayName] = def.id);

function skipMigration() {
    // set to false if migration is needed
    return true;
}

async function doMigration() {
    // This is sample code
    // implement this method in case data migration is needed and set skipMigration to false
    const positions = await db.getAllDocuments('position');

    const promises = [];

    for (const d of positions) {
        if (!needsCurrencyMig(d)) {
            continue;
        }
        d.currency = currencyIdsByDisplayName[d.currency];
        promises.push(db.put(d));
    }

    return Promise.all(promises);
}

function needsCurrencyMig(d) {
    return d.currency && (d.currency === 'CHF' || d.currency === '€');
}

async function migrate() {
    // migration is not run on mobile devices and only if there are no unsynced documents
    if (window.location.hostname !== 'localhost' || UnsyncedDocuments.count() > 0 || skipMigration()) {
        return;
    }

    db.setupMigrationDb();

    await doMigration();

    db.teardownMigrationDb();
}

export { migrate };
