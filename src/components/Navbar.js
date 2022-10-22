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
// FIXME new button deaktivieren wenn das form sichtbar ist
// FIXME Funktionalität für new button
export default function Navbar(props) {
    return (
        <nav id="navbar" className="navbar navbar-dark bg-dark">
            <div className="container-lg">
                {props.children}
            </div>
        </nav>
    );
};
