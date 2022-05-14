import * as UnsyncedDocuments from './UnsyncedDocuments.js';
import * as expensesApp from './App.js';

import PouchDb from 'pouchdb-browser';
import PouchDbFind from 'pouchdb-find';
import { markEverythingDirty } from './state.js';

PouchDb.plugin(PouchDbFind);

const databaseName = getDatabaseName();
const databaseConnectionString = `https://${window.location.hostname}:6984/${databaseName}`;
const pouchDb = new PouchDb(databaseName);
pouchDb.sync(databaseConnectionString, {
    live: true,
    retry: true
}).on('change', function (info) {
    if (info.change.ok && info.direction === 'push') {
        for (const doc of info.change.docs) {
            UnsyncedDocuments.markSynced(doc._id);
        }
        expensesApp.render();
    }
    if (info.direction === 'pull' && info.change.pending === 0) {
        markEverythingDirty();
        expensesApp.render();
    }
});

const descriptionIndexPromise = pouchDb.createIndex({
    index: {
        fields: ['entity', 'recurring', 'description']
    }
});

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

function put(document) {
    UnsyncedDocuments.markUnsynced(document._id);
    return pouchDb.put(document);
}

function remove(document) {
    document._deleted = true;
    return put(document);
}

async function getAllDocuments(entity) {
    const allDocs = await pouchDb.allDocs({ include_docs: true });
    return allDocs.rows
        .map(r => r.doc)
        .filter(d => d.entity === entity)
}

async function getDocument(entity, id) {
    const doc = await pouchDb.get(id);
    return doc.entity === entity ? doc : null;
}

export { isEmpty, addMany, getAllDocuments, getDocument, put, remove, queryDescription };
