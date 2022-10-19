import * as ViewMode from '../enums/ViewMode.js';

import React, { useState } from 'react';

import Blindtext from './Blindtext';
import DayExpenses from './DayExpenses.js';
import Navbar from './Navbar';

// TODO gleich Router einbauen?
// TODO Aufteilung Spalten auf mobile 50/50 horiz/vert umsetzen
// TODO Form overlay umsetzen
function App() {
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(ViewMode.MONTH_DISPLAY);
  return (
    <div id="app" className='h-100 d-flex flex-column'>
      <Navbar date={date} setDate={setDate}
        viewMode={viewMode} setViewMode={setViewMode} />
      <div className="container overflow-hidden">
        <div className="row h-100">
          <div id="main" className='col col-8 h-100 overflow-auto'>
            <Blindtext numParagraphs={10}></Blindtext>
          </div>
          <div id="side" className='col col-4 h-100 overflow-auto'>
            <DayExpenses date={date} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
