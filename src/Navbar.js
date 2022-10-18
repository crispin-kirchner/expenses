import * as constants from './constants';
import * as dates from './dates.js';

import React from 'react';

function LinkButton(props) {
    return (
        <button
            className="btn text-light"
            type="button"
            title={props.title}
            onClick={props.onClick}>
            <i className={props.icon}></i>
        </button>
    );
}

// TODO Texte verwenden
function Navbar(props) {
    return (
        <nav id="navbar" className="navbar navbar-dark bg-dark">
            <div className="container">
                <div className='navbar-brand'>
                    <LinkButton
                        title="Vorheriger Monat"
                        icon="bi-chevron-left"
                        onClick={() => props.setDate(dates.decrementMonth(props.date))} />

                    <LinkButton
                        title="Nächster Monat"
                        icon="bi-chevron-right"
                        onClick={() => props.setDate(dates.incrementMonth(props.date))} />
                    {constants.monthFormat.format(props.date)}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
