import * as ViewMode from '../enums/ViewMode.js';
import * as dates from '../utils/dates.js';

import React from 'react';
import formats from '../utils/formats.js';
import t from '../utils/texts.js';

function LinkButton(props) {
    return (
        <button
            className="btn text-light"
            type="button"
            title={props.title}
            onClick={props.onClick}>
            <i className={`bi ${props.icon}`}></i>
        </button>
    );
}

// TODO Texte für vorheriger und nächster Monat hinzufügen
function BrandContent(props) {
    if (props.viewMode === ViewMode.MONTH_DISPLAY) {
        return (<>
            <LinkButton
                title={t('EditTags')}
                icon="bi-tags-fill"
                onClick={() => props.setViewMode(ViewMode.MANAGE_TAGS)} />
            <LinkButton
                icon="bi-chevron-left"
                onClick={() => props.setDate(dates.decrementMonth(props.date))} />

            <LinkButton
                icon="bi-chevron-right"
                onClick={() => props.setDate(dates.incrementMonth(props.date))} />
            {formats.month(props.date)}
        </>);
    }
    if (props.viewMode === ViewMode.MANAGE_TAGS) {
        return (<>
            <LinkButton
                icon="bi-arrow-left"
                onClick={() => props.setViewMode(ViewMode.MONTH_DISPLAY)} />
            {t('EditTags')}
        </>);
    }
}

// TODO die restlichen Features
export default function Navbar(props) {
    return (
        <nav id="navbar" className="navbar navbar-dark bg-dark">
            <div className="container">
                <div className='navbar-brand'>
                    <BrandContent date={props.date} setDate={props.setDate}
                        viewMode={props.viewMode} setViewMode={props.setViewMode} />
                </div>
            </div>
        </nav>
    );
};
