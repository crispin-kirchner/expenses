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
  const [sidebarCollapse, setSidebarCollapse] = useState(true);

  return (
    <div id="sidebar" className={`position-absolute p-2 h-100 d-flex flex-column flex-shrink-0 bg-light ${sidebarCollapse ? 'collapsed' : ''}`}>
      <span className="d-none d-xl-block">
        <i className="bi bi-piggy-bank align-middle" style={{ fontSize: '2rem' }}></i>
        <span className='sidebar-brand align-middle ms-2'>{t('Expenses')}</span>
      </span>
      <a href="#" onClick={() => setSidebarCollapse(sc => !sc)} className="d-xl-none text-nowrap align-middle link-dark text-decoration-none" data-bs-toggle="tooltip" data-bs-placement="right">
        <i className='bi bi-list align-middle' style={{ fontSize: '2rem' }}></i>
        <span className="ms-2 collapsed-hidden align-middle sidebar-brand">{t('Expenses')}</span>
      </a>
      <hr className='mt-2' />
      {children}
    </div>
  );
}

Sidebar.Section = Section;
Sidebar.Item = Item;