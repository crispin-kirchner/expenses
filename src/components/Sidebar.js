// TODO nen burger machen mit nem Pfeil
import { Squash as Hamburger } from 'hamburger-react';
import t from "../utils/texts";

// TODO tooltips solange collapsed ist
function Item({ active, onClick, icon, text }) {
  return (
    <li className={`${active ? 'nav-item' : ''}`}>
      <button type="button" className={`nav-link text-nowrap w-100 text-start ${active ? 'active' : ''}`} onClick={onClick}>
        <i className={`bi bi-${icon}`}></i>
        <span className='ms-2 collapsed-hidden'>{text}</span>
      </button>
    </li>
  );
}

/* TODO text-overflow ellipsis */
function Section({ caption, children }) {
  return <>
    <strong><small>{caption}</small></strong>
    <ul className='nav nav-pills flex-column'>
      {children}
    </ul>
  </>;
}

export default function Sidebar({ children, isCollapsed, toggleSidebar }) {
  return (
    <div id="sidebar" className={`position-absolute p-2 h-100 d-flex flex-column flex-shrink-0 bg-light ${isCollapsed ? 'collapsed' : ''}`}>
      <span className="d-none d-xl-flex align-items-center text-center">
        <div className='bg-dark text-light rounded' style={{ width: '48px' }}>
          <i className="bi bi-piggy-bank" style={{ fontSize: '2rem' }}></i>
        </div>
        <span className='sidebar-brand ms-2'>{t('Expenses')}</span>
      </span>
      <span className="d-flex align-items-center d-xl-none">
        <Hamburger toggled={!isCollapsed} toggle={toggleSidebar} />
        <span className="ms-2 collapsed-hidden sidebar-brand">{t('Expenses')}</span>
      </span>
      <hr className='mt-2' />
      {children}
    </div>
  );
}

Sidebar.Section = Section;
Sidebar.Item = Item;