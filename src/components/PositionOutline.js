import * as PositionType from '../enums/PositionType.js';

import Database, { DbContext, useDataVersion } from "./Database.js";
import React, { useCallback, useContext, useState } from "react";
import { computeMonthlyAmountChf, createEmptyPosition, getSign } from "../utils/positions.js";
import { decrementMonth, incrementMonth, isSameDay, toYmd } from '../utils/dates.js';
import { deletePosition, getPositionsOfMonth, loadPosition, storePosition } from "../services/PositionService.js";

import DayPositions from "./DayPositions.js";
import { LinkButton } from "./Navbar";
import MonthChart from "./MonthChart.js";
import MonthDisplay from "../enums/MonthDisplay.js";
import Outline from "./Outline";
import Overview from "./Overview";
import OverviewSections from "../enums/OverviewSections.js";
import PositionForm from "./PositionForm.js";
import _ from 'lodash';
import { formatMonth } from "../utils/formats.js";
import { getTags } from '../utils/tags.js';
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

function getOverviewSection(pos) {
    return _.find(OverviewSections, s => s.type && pos.type === s.type && s.recurringFilter(pos)).id;
}

function MonthDisplayComponent({ monthDisplay, date, incomePositions, recurringPositions, expensePositions, editPosition, positionsByDay }) {
    switch (monthDisplay) {
        case MonthDisplay.OVERVIEW.id:
        default:
            return <Overview
                incomePositions={incomePositions}
                recurringPositions={recurringPositions}
                expensePositions={expensePositions}
                editPosition={editPosition} />
        case MonthDisplay.CHART.id:
            return <MonthChart
                date={date}
                incomeAmount={incomePositions.monthlyAmountChf}
                recurringAmount={recurringPositions.monthlyAmountChf}
                positionsByDay={positionsByDay} />;
    }
}


// FIXME zwischen "s" und "md" könnte man den navbar-container hier nicht-fluid machen weil das Form es nicht ist
export default function PositionOutline({ unsyncedDocuments, monthDisplay, setMonthDisplay }) {
    const [date, setDate] = useState(new Date());
    const [editedPosition, setEditedPosition] = useState(null);

    const [positionsOfMonth, setPositionsOfMonth] = useState({});

    const [incomePositions, setIncomePositions] = useState({ childRows: [] });
    const [recurringPositions, setRecurringPositions] = useState({ childRows: [] });
    const [expensePositions, setExpensePositions] = useState({ childRows: [] });
    const [positionsByDay, setPositionsByDay] = useState(null);

    const { dataVersion, incrementDataVersion } = useDataVersion();

    const db = useContext(DbContext);

    const queryCallback = useCallback(async db => {
        const positions = await getPositionsOfMonth(db, date);

        const positionsLabeled = _.map(positions, pos => ({
            ...pos,
            monthlyAmountChf: computeMonthlyAmountChf(pos),
            tags: getTags(pos.description)
        }));

        const overviewSections = _(positionsLabeled)
            .groupBy(getOverviewSection)
            .map((positions, overviewSection) => ({
                _id: overviewSection,
                monthlyAmountChf: _.sumBy(positions, 'monthlyAmountChf'),
                childRows: positions
            }))
            .keyBy('_id')
            .value();

        setPositionsByDay(_(positionsLabeled)
            .filter(pos => !pos.recurring)
            .groupBy(pos => toYmd(pos.date))
            .map((positions, ymd) => {
                const byType = _.groupBy(positions, 'type');

                return {
                    ymd: ymd,
                    expensesSum: _.sumBy(byType[PositionType.EXPENSE], 'monthlyAmountChf'),
                    earningsSum: _.sumBy(byType[PositionType.INCOME], 'monthlyAmountChf'),
                    positions
                };
            })
            .keyBy('ymd')
            .value());

        setPositionsOfMonth(_.keyBy(positions, '_id'));
        setIncomePositions(overviewSections[OverviewSections.INCOME.id] || { monthlyAmountChf: '0', childRows: [] });
        setRecurringPositions(overviewSections[OverviewSections.RECURRING.id] || { monthlyAmountChf: '0', childRows: [] });
        setExpensePositions(overviewSections[OverviewSections.EXPENSE.id] || { monthlyAmountChf: '0', childRows: [] });
    },
        [date]);

    const newPosition = d => setEditedPosition(createEmptyPosition(d));
    const editPosition = async id => setEditedPosition(await loadPosition(db, id));

    const saveAction = async pos => {
        setEditedPosition(null);
        pos.createDate = pos.createDate || new Date();
        storePosition(db, pos);
        incrementDataVersion();
    };

    const deleteAction = async id => {
        setEditedPosition(null);
        const position = positionsOfMonth[id];
        deletePosition(db, position);
        incrementDataVersion();
    };

    const dayPositions = !positionsByDay
        ? { ymd: toYmd(date), positions: null }
        : positionsByDay[toYmd(date)] || { ymd: toYmd(date), positions: [] };

    // TODO refactoren zu PositionOutlineQuery
    // TODO prüfen wie es mit dem footer weitergehen soll
    return (
        <Database.LiveQuery queryCallback={queryCallback} dataVersion={dataVersion}>
            <Outline
                navbarBrandContent={<BrandContent date={date} setDate={setDate} />}
                navbarFormContent={<>
                    {isSameDay(new Date(), date) ? null : <LinkButton
                        icon='bi-calendar-date-fill'
                        title={t('Today')}
                        onClick={() => setDate(new Date())} />}
                    {unsyncedDocuments}
                    <LinkButton
                        className={"btn btn-light d-none d-sm-inline-block ms-2"}
                        icon="bi-plus-square"
                        title={t('New')}
                        onClick={() => newPosition(date)}
                        disabled={!!editedPosition}>
                        <span className='d-none d-sm-inline-block'>&nbsp;{t('New')}</span>
                    </LinkButton>
                </>}
                main={<MonthDisplayComponent
                    monthDisplay={monthDisplay}
                    date={date}
                    incomePositions={incomePositions}
                    recurringPositions={recurringPositions}
                    expensePositions={expensePositions}
                    editPosition={editPosition}
                    positionsByDay={positionsByDay} />}
                sideOnMobile={MonthDisplay[monthDisplay].sideOnMobile}
                side={<DayPositions dayPositions={dayPositions} newPosition={newPosition} editPosition={editPosition} />}
                rightDrawer={() => <PositionForm
                    position={editedPosition}
                    saveAction={saveAction}
                    abortAction={() => setEditedPosition(null)}
                    deleteAction={deleteAction} />}
                rightDrawerVisible={!!editedPosition}
                footerContent={<>
                    <div className="me-auto">
                        {Object.values(MonthDisplay).map(md => <button type="button" key={md.id} className={`btn ${md.id === monthDisplay ? 'active' : ''}`} onClick={() => setMonthDisplay(md.id)}><i className={`bi bi-${md.icon}`} /></button>)}
                    </div>
                    <>
                        <button type="button" className="btn btn-primary" onClick={() => newPosition(date)}><i className="bi bi-plus-square" /> {t('New')}</button>
                    </>
                </>} />
        </Database.LiveQuery>
    );
}
