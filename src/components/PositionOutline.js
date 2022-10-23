import React, { useState } from "react";
import { createEmptyPosition, loadPosition } from "../services/PositionService.js";
import { decrementMonth, incrementMonth } from '../utils/dates.js';

import DayExpenses from "./DayExpenses.js";
import { LinkButton } from "./Navbar";
import MonthDisplay from "../enums/MonthDisplay.js";
import Outline from "./Outline";
import Overview from "./Overview";
import PositionForm from "./PositionForm.js";
import { formatMonth } from "../utils/formats.js";
import t from "../utils/texts.js";

function BrandContent(props) {
    return (<>
        <LinkButton
            icon="bi-chevron-left"
            onClick={() => props.setDate(decrementMonth(props.date))} />

        <LinkButton
            icon="bi-chevron-right"
            onClick={() => props.setDate(incrementMonth(props.date))} />
        {formatMonth(props.date)}
    </>);
}

// FIXME zwischen "s" und "md" sind zwei new buttons sichtbar und man könnte den navbar-container hier nicht-fluid machen weil das Form es nicht ist
export default function PositionOutline(props) {
    const [date, setDate] = useState(new Date());
    const [editedPosition, setEditedPosition] = useState(null);
    const [monthDisplay, setMonthDisplay] = useState(MonthDisplay.CALENDAR.id);

    const newPosition = d => setEditedPosition(createEmptyPosition(d));
    const editPosition = async id => setEditedPosition(await loadPosition(id));

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
            main={<Overview date={date} editPosition={editPosition} />}
            sideOnMobile={MonthDisplay[monthDisplay].sideOnMobile}
            side={<DayExpenses date={date} newPosition={newPosition} editPosition={editPosition} />}
            rightDrawer={() => <PositionForm
                position={editedPosition}
                abortAction={() => setEditedPosition(null)} />}
            rightDrawerVisible={!!editedPosition}
            footerContent={<>
                <div className="me-auto">
                    {Object.values(MonthDisplay).map(md => <button type="button" key={md.id} className={`btn ${md.id === monthDisplay ? 'active' : ''}`} onClick={() => setMonthDisplay(md.id)}><i className={`bi bi-${md.icon}`} /></button>)}
                </div>
                <>
                    <button type="button" className="btn btn-primary" onClick={() => newPosition(date)}><i className="bi bi-plus-square" /> {t('New')}</button>
                </>
            </>} />
    </>;
}
