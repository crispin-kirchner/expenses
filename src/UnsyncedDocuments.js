const UNSYNCED_DOCUMENTS_KEY = 'unsyncedDocuments';

const unsyncedDocuments = initialize();

function initialize() {
    const storedUnsyncedItems = localStorage.getItem(UNSYNCED_DOCUMENTS_KEY);
    if (storedUnsyncedItems) {
        return new Set(JSON.parse(storedUnsyncedItems));
    }
    return new Set();
}

function store() {
    localStorage.setItem(UNSYNCED_DOCUMENTS_KEY, JSON.stringify([...unsyncedDocuments]));
}

function markUnsynced(id) {
    unsyncedDocuments.add(id);
    store();
}

function markSynced(id) {
    unsyncedDocuments.delete(id);
    store();
}

function count() {
    return unsyncedDocuments.size;
}

export {
    count,
    markUnsynced,
    markSynced
};
