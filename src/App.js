import React, { useState } from 'react';

import Blindtext from './Blindtext';
import Navbar from './Navbar.js';

// TODO gleich Router einbauen?
// TODO Desktop-Aufteilung auf mobile
// TODO State-Variablen in state-Modul zurückschieben?
function App() {
  const [date, setDate] = useState(new Date());
  return (
    <div id="app" className='h-100 d-flex flex-column'>
      <Navbar date={date} setDate={setDate}></Navbar>
      <div className="container overflow-hidden">
        <div className="row h-100">
          <div id="main" className='col col-8 h-100 overflow-auto'>
            <Blindtext numParagraphs={10}></Blindtext>
          </div>
          <div id="side" className='col col-4 h-100 overflow-auto'>
            <Blindtext numParagraphs={10}></Blindtext>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
