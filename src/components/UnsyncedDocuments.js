import React, { useCallback, useState } from "react";

import LocalStorage from "../enums/LocalStorage";

function load() {
    let unsyncedDocumentsString = localStorage.getItem(LocalStorage.UNSYNCED_DOCUMENTS);
    if (!unsyncedDocumentsString) {
        unsyncedDocumentsString = '[]';
        localStorage.setItem(LocalStorage.UNSYNCED_DOCUMENTS, unsyncedDocumentsString);
    }
    return new Set(JSON.parse(unsyncedDocumentsString));
}

function store(unsyncedDocuments, setUnsyncedDocuments) {
    localStorage.setItem(LocalStorage.UNSYNCED_DOCUMENTS, JSON.stringify([...unsyncedDocuments]));
    setUnsyncedDocuments(unsyncedDocuments);
}

export function useUnsyncedDocuments() {
    const [unsyncedDocuments, setUnsyncedDocuments] = useState(load());

    const markUnsynced = useCallback(id => {
        const unsyncedDocs = load();
        unsyncedDocs.add(id);
        store(unsyncedDocs, setUnsyncedDocuments);
    },
        []);

    const markSynced = useCallback(ids => {
        const unsyncedDocs = load();
        ids.forEach(id => unsyncedDocs.delete(id));
        store(unsyncedDocs, setUnsyncedDocuments);
    },
        []);

    return { unsyncedDocuments, markUnsynced, markSynced };
};

export default function UnsyncedDocuments({ unsyncedDocuments }) {
    const count = unsyncedDocuments.size;
    if (count <= 0) {
        return null;
    }
    return (
        <button type="button" className="btn text-light position-relative">
            <i className="bi bi-cloud-upload-fill" />
            <span className="position-absolute top-0 end-0 badge rounded-pill bg-danger" style={{ "--bs-bg-opacity": .8 }}>
                {count}
            </span>
        </button>
    );
}
