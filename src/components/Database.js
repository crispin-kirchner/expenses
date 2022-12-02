import React, { useCallback, useContext, useEffect, useState } from "react";

import PouchDbBrowser from 'pouchdb-browser';
import _ from 'lodash';

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

class DbWrapper {
    constructor(markUnsynced, markSynced) {
        this._markUnsynced = markUnsynced;
        this._markSynced = markSynced;
        this.liveQueries = new Set();

        const dbName = getDatabaseName();

        this.pouchDb = new PouchDbBrowser(dbName);

        this._changeHandler = info => {
            try {
                if (!info.change.ok) {
                    return;
                }
                if (info.direction === 'push') {
                    this._markSynced(_.map(info.change.docs, '_id'));
                }
                if (info.direction === 'pull' && info.change.pending === 0) {
                    this.liveQueries.forEach(q => q(this));
                }
            }
            catch (error) {
                console.error('Error in Database changeHandler', error);
                throw error;
            }
        };

        const connectionString = `https://${window.location.hostname}:6984/${dbName}`;
        this._sync = this.pouchDb.sync(connectionString, { live: true, retry: true });
        this._sync.on('change', this._changeHandler);
    }

    cleanup() {
        this._sync.cancel();
        this._sync.off('change', this._changeHandler)
        this._sync = null;
        this.pouchDb = null;
    }

    put(document) {
        this._markUnsynced(document._id);
        return this.pouchDb.put(document);
    }

    remove(document) {
        document._deleted = true;
        return this.put(document);
    }

    async getAllDocuments(entity) {
        const options = { include_docs: true };
        const allDocs = await this.pouchDb.allDocs(options);
        return allDocs.rows
            .map(r => r.doc)
            .filter(d => d.entity === entity);
    }

    async getDocument(entity, id) {
        const doc = await this.pouchDb.get(id);
        return doc.entity === entity ? doc : null;
    }
}

const DbContext = React.createContext();
export { DbContext };

export default function Database({ children, markUnsynced, markSynced }) {
    const [db, setDb] = useState(null);
    useEffect(() => {
        setDb(new DbWrapper(markUnsynced, markSynced));

        return () => {
            db?.cleanup();
            setDb(null);
        }
    }, [markUnsynced, markSynced]);
    // Linter meckiert über fehlende Dependency "db"; wenn man die hinzufügt explodiert die Welt -> nicht machen

    return (
        <DbContext.Provider value={db}>
            {children}
        </DbContext.Provider>
    );
};

function LiveQuery({ queryCallback, dataVersion, children }) {
    const database = useContext(DbContext);
    useEffect(() => {
        database?.pouchDb && queryCallback(database);
    }, [database, queryCallback, dataVersion]);

    useEffect(() => {
        database?.liveQueries.add(queryCallback);
        return () => database?.liveQueries.delete(queryCallback);
    }, [database, queryCallback])

    return <>{children}</>;
}

export function useDataVersion() {
    const [dataVersion, setDataVersion] = useState(0);

    const incrementDataVersion = useCallback(() => {
        setDataVersion(dv => dv + 1);
    }, []);

    return { dataVersion, incrementDataVersion };
}

Database.LiveQuery = LiveQuery;
