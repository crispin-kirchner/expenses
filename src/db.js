import PouchDB from 'pouchdb-browser';

const databaseName = getDatabaseName();
const pouchDb = new PouchDB(databaseName);
pouchDb.sync('http://localhost:5984/' + databaseName, {
    live: true,
    retry: true
});

function getDatabaseName() {
    switch (window.location.host) {
        case 'localhost:3000':
            return 'expenses-dev';
        case 'localhost:9767':
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

export { isEmpty, addMany, getAllDocuments, getDocument, put, remove };
