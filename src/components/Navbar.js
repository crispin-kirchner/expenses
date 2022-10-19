import * as ViewMode from '../enums/ViewMode.js';
import * as dates from '../utils/dates.js';

import React from 'react';
import formats from '../utils/formats.js';
import { isNewButtonVisible } from '../utils/general.js';
import t from '../utils/texts.js';

function LinkButton(props) {
    const className = props.className || 'btn text-light';
    return (
        <button
            className={className}
            type="button"
            title={props.title}
            onClick={props.onClick}>
            <i className={`bi ${props.icon}`}></i>
            {props.children}
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
// FIXME new button deaktivieren wenn das form sichtbar ist
// FIXME Funktionalität für new button
export default function Navbar(props) {
    return (
        <nav id="navbar" className="navbar navbar-dark bg-dark">
            <div className="container">
                <div className='navbar-brand'>
                    <BrandContent date={props.date} setDate={props.setDate}
                        viewMode={props.viewMode} setViewMode={props.setViewMode} />
                </div>
                <form className="d-flex" autoComplete='off'>
                    {isNewButtonVisible(props.viewMode) ? <LinkButton
                        className="btn btn-light d-none d-sm-inline-block"
                        icon="bi-plus-square"
                        title={t('New')}>
                        <span className='d-none d-sm-inline-block'>&nbsp;{t('New')}</span>
                    </LinkButton> : ''}
                </form>
            </div>
        </nav>
    );
};
