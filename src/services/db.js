// import * as App from './App.js';

import PouchDb from 'pouchdb-browser';
import PouchDbFind from 'pouchdb-find';

// import { markEverythingDirty } from './state.js';
// import * as UnsyncedDocuments from './UnsyncedDocuments.js';


PouchDb.plugin(PouchDbFind);

const databaseName = getDatabaseName();
const databaseConnectionString = `https://${window.location.hostname}:6984/${databaseName}`;
let migrationDb;
let pouchDb;
let descriptionIndexPromise;

function setupApplicationDb() {
    const applicationDb = new PouchDb(databaseName);
    applicationDb.sync(databaseConnectionString, {
        live: true,
        retry: true
    }).on('change', function (info) {
        if (info.change.ok && info.direction === 'push') {
            for (const doc of info.change.docs) {
                // FIXME wieder hinzufügen
                // UnsyncedDocuments.markSynced(doc._id);
            }
            // App.render();
        }
        if (info.direction === 'pull' && info.change.pending === 0) {
            // markEverythingDirty();
            // App.render();
        }
    });

    descriptionIndexPromise = applicationDb.createIndex({
        index: {
            fields: ['entity', 'recurring', 'description']
        }
    });

    pouchDb = applicationDb;
}

function setupMigrationDb() {
    // remove cached data
    const applicationDb = new PouchDb(databaseName);
    applicationDb.destroy();

    // direct connection, no caching
    migrationDb = new PouchDb(databaseConnectionString);
    pouchDb = migrationDb;
}

function teardownMigrationDb() {
    if (!migrationDb) {
        return;
    }
    migrationDb = null;
    pouchDb = null;
}

async function queryDescription(query) {
    await descriptionIndexPromise;
    return pouchDb.find(query);
}

function getDatabaseName() {
    switch (window.location.port) {
        case '3000':
            return 'expenses-dev';
        case '9767':
            return 'expenses-prod';
        default:
            throw new Error('Could not determine database name, aborting');
    }
}

async function isEmpty() {
    const allDocs = await pouchDb.allDocs({ limit: 1 });
    return allDocs.rows.length === 0;
}

function addMany(documents) {
    const promises = [];
    for (let i = 0; i < documents.length; ++i) {
        promises.push(pouchDb.put(documents[i], (err, _) => {
            console.log(`[${i}]: ${documents[i]._id} [ ${!err ? 'OK ' : 'NOK'} ]`);
        }));
    }
    return Promise.all(promises);
}

function isMigrationDb() {
    return !!pouchDb && migrationDb === pouchDb;
}

function put(document) {
    // FIXME cki unsyncedDocuments wieder aktivieren
    // UnsyncedDocuments.markUnsynced(document._id);
    return pouchDb.put(document);
}

function remove(document) {
    document._deleted = true;
    return put(document);
}

async function getAllDocuments(entity) {
    const options = { include_docs: true };
    const allDocs = await pouchDb.allDocs(options);
    return allDocs.rows
        .map(r => r.doc)
        .filter(d => d.entity === entity)
}

async function getDocument(entity, id) {
    const doc = await pouchDb.get(id);
    return doc.entity === entity ? doc : null;
}

export { isEmpty, isMigrationDb, addMany, getAllDocuments, getDocument, put, remove, setupApplicationDb, setupMigrationDb, teardownMigrationDb, queryDescription };
