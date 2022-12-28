// TODO nen burger machen mit nem Pfeil
import { Squash as Hamburger } from 'hamburger-react';
import t from "../utils/texts";
import { useState } from "react";

// TODO tooltips solange collapsed ist
function Item({ active, onClick, icon, text }) {
  return (
    <li className={`${active ? 'nav-item' : ''}`}>
      <a href="#" className={`nav-link text-nowrap ${active ? 'active' : ''}`} onClick={onClick}>
        <i className={`bi bi-${icon}`}></i>
        <span className='ms-2 collapsed-hidden'>{text}</span>
      </a>
    </li>
  );
}

function Section({ caption, children }) {
  return <>
    <strong><small>{caption}</small></strong>
    <ul className='nav nav-pills flex-column'>
      {children}
    </ul>
  </>;
}

export default function Sidebar({ children }) {
  const [isCollapsed, setCollapsed] = useState(true);

  return (
    <div id="sidebar" className={`position-absolute p-2 h-100 d-flex flex-column flex-shrink-0 bg-light ${isCollapsed ? 'collapsed' : ''}`}>
      <span className="d-none d-xl-flex align-items-center text-center">
        <div style={{ width: '48px' }}>
          <i className="bi bi-piggy-bank" style={{ fontSize: '2rem' }}></i>
        </div>
        <span className='sidebar-brand ms-2'>{t('Expenses')}</span>
      </span>
      <span className="d-flex align-items-center d-xl-none">
        <Hamburger toggled={!isCollapsed} toggle={() => setCollapsed(c => !c)} />
        <span className="ms-2 collapsed-hidden sidebar-brand">{t('Expenses')}</span>
      </span>
      <hr className='mt-2' />
      {children}
    </div>
  );
}

Sidebar.Section = Section;
Sidebar.Item = Item;