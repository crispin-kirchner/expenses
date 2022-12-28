import { Squash as Hamburger } from 'hamburger-react';
import React from 'react';

export function LinkButton(props) {
    const className = props.className || 'btn text-light';
    return (
        <button
            className={className}
            type="button"
            title={props.title}
            onClick={props.onClick}
            disabled={props.disabled}>
            <i className={`bi ${props.icon}`}></i>
            {props.children}
        </button>
    );
};

// TODO die restlichen Features
export default function Navbar({ children }) {
    return (
        <nav id="navbar" className="navbar navbar-dark text-light bg-dark">
            <div className="container-lg">
                {children}
            </div>
        </nav>
    );
};

function Brand({ children, isSidebarCollapsed, toggleSidebar }) {
    return (
        <div className='d-flex'>
            <div className="d-sm-none">
                <Hamburger toggled={!isSidebarCollapsed} toggle={toggleSidebar} />
            </div>
            <div className='navbar-brand'>
                {children}
            </div>
        </div>
    );
}

Navbar.Brand = Brand;

function Form({ children }) {
    return (
        <form className="d-flex" autoComplete='off'>
            {children}
        </form>
    );
}
Navbar.Form = Form;
