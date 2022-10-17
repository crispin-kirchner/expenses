import './App.css';

import Blindtext from './Blindtext';
import Navbar from './Navbar.js';
import React from 'react';

// TODO Desktop-Aufteilung auf mobile
function App() {
  return (
    <div id="app" className='h-100 d-flex flex-column'>
      <Navbar></Navbar>
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
