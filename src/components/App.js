import * as ViewMode from '../enums/ViewMode.js';

import React, { useCallback, useState } from 'react';
import UnsyncedDocuments, { useUnsyncedDocuments } from './UnsyncedDocuments.js';

import Database from './Database.js';
import EditTagsOutline from './EditTagsOutline.js';
import MonthDisplay from '../enums/MonthDisplay.js';
import PositionOutline from './PositionOutline.js';
import Sidebar from './Sidebar.js';
import t from '../utils/texts.js';

function getOutline(viewMode, unsyncedDocuments, monthDisplay, setMonthDisplay, isSidebarCollapsed, toggleSidebar) {
  switch (viewMode) {
    case ViewMode.MONTH_DISPLAY:
    default:
      return <PositionOutline unsyncedDocuments={unsyncedDocuments} isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} monthDisplay={monthDisplay} setMonthDisplay={setMonthDisplay} />

    case ViewMode.MANAGE_TAGS:
      return <EditTagsOutline unsyncedDocuments={unsyncedDocuments} isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />;
  }
}

// TODO gleich Router einbauen?
function App() {
  const { unsyncedDocuments, markUnsynced, markSynced } = useUnsyncedDocuments();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [viewMode, setViewMode] = useState(ViewMode.MONTH_DISPLAY);
  const [monthDisplay, setMonthDisplay] = useState(MonthDisplay.CALENDAR.id);

  const toggleSidebar = useCallback(() => setSidebarCollapsed(c => !c), [setSidebarCollapsed]);

  const unsyncedDocumentsComponent = <UnsyncedDocuments unsyncedDocuments={unsyncedDocuments} />;

  return (
    <div className='position-relative h-100'>
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar}>
        <Sidebar.Section caption={t('Month')}>
          {Object.values(MonthDisplay).map(md => (
            <Sidebar.Item
              key={md.id}
              active={viewMode === ViewMode.MONTH_DISPLAY && monthDisplay === md.id}
              onClick={() => {
                setViewMode(ViewMode.MONTH_DISPLAY);
                setMonthDisplay(md.id);
              }}
              icon={md.icon}
              text={md.text} />
          ))}
        </Sidebar.Section>
        <hr />
        <Sidebar.Section caption={t('Settings')}>
          <Sidebar.Item
            active={viewMode === ViewMode.MANAGE_TAGS}
            onClick={() => setViewMode(ViewMode.MANAGE_TAGS)}
            icon="tags-fill"
            text={t('EditTags')} />
        </Sidebar.Section>
      </Sidebar>
      <Database markUnsynced={markUnsynced} markSynced={markSynced}>
        {getOutline(viewMode, unsyncedDocumentsComponent, monthDisplay, setMonthDisplay, isSidebarCollapsed, toggleSidebar)}
      </Database>
    </div>
  );
}

export default App;
