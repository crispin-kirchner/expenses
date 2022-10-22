import React, { useState } from "react";
import { decrementMonth, incrementMonth } from '../utils/dates.js';

import DayExpenses from "./DayExpenses.js";
import { LinkButton } from "./Navbar";
import MonthDisplay from "../enums/MonthDisplay.js";
import Outline from "./Outline";
import Overview from "./Overview";
import PositionForm from "./PositionForm.js";
import { createEmptyPosition } from "../services/PositionService.js";
import formats from '../utils/formats';
import t from "../utils/texts.js";

function Fab(props) {
    return (
        <div className="position-fixed pb-3 px-3 bottom-0 end-0 d-sm-none d-flex justify-content-end">
            <button type="button" className="btn btn-primary" onClick={props.onClick}>
                <i className="bi-plus-square"></i>
                &nbsp;{t('New')}
            </button>
        </div>
    );
}

function BrandContent(props) {
    return (<>
        <LinkButton
            icon="bi-chevron-left"
            onClick={() => props.setDate(decrementMonth(props.date))} />

        <LinkButton
            icon="bi-chevron-right"
            onClick={() => props.setDate(incrementMonth(props.date))} />
        {formats.month(props.date)}
    </>);
}

export default function PositionOutline(props) {
    const [date, setDate] = useState(new Date());
    const [editedPosition, setEditedPosition] = useState(null);
    const [monthDisplay, setMonthDisplay] = useState(MonthDisplay.OVERVIEW.id);

    const newPosition = d => setEditedPosition(createEmptyPosition(d));

    return <>
        <Outline
            navbarContent={<>
                <div className='navbar-brand'>
                    <BrandContent date={date} setDate={setDate} />
                </div>
                <form className="d-flex" autoComplete='off'>
                    <LinkButton
                        className={"btn btn-light d-none d-sm-inline-block"}
                        icon="bi-plus-square"
                        title={t('New')}
                        onClick={() => newPosition(date)}
                        disabled={!!editedPosition}>
                        <span className='d-none d-sm-inline-block'>&nbsp;{t('New')}</span>
                    </LinkButton>
                </form>
            </>}
            main={<Overview date={date} />}
            sideOnMobile={MonthDisplay[monthDisplay].sideOnMobile}
            side={<DayExpenses date={date} newPosition={newPosition} />}
            rightDrawer={() => <PositionForm
                position={editedPosition}
                abortAction={() => setEditedPosition(null)} />}
            rightDrawerVisible={!!editedPosition}
            footerContent={
                <nav className="nav">
                    {Object.values(MonthDisplay).map(md => <a key={md.id} className={`nav-link ${md.id === monthDisplay ? 'active' : ''}`} href="#" onClick={() => setMonthDisplay(md.id)}><i className={`bi bi-${md.icon}`} /></a>)}
                </nav>
            } />
        {!editedPosition ? <Fab onClick={() => newPosition(date)} /> : null}
    </>;
}
