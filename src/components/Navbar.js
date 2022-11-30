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
export default function Navbar({ brandContent, formContent }) {
    return (
        <nav id="navbar" className="navbar navbar-dark text-light bg-dark">
            <div className="container-lg">
                <div className='navbar-brand'>
                    {brandContent}
                </div>
                <form className="d-flex" autoComplete='off'>
                    {formContent}
                </form>
            </div>
        </nav>
    );
};
