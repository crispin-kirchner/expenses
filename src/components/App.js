import UnsyncedDocuments, { useUnsyncedDocuments } from './UnsyncedDocuments.js';

import Database from './Database.js';
import PositionOutline from './PositionOutline.js';
import React from 'react';

// TODO gleich Router einbauen?
function App() {
  const { unsyncedDocuments, markUnsynced, markSynced } = useUnsyncedDocuments();

  const unsyncedDocumentsComponent = <UnsyncedDocuments unsyncedDocuments={unsyncedDocuments} />;

  return (
    <Database markUnsynced={markUnsynced} markSynced={markSynced}>
      <PositionOutline unsyncedDocuments={unsyncedDocumentsComponent} />
    </Database>
  );
}

export default App;
