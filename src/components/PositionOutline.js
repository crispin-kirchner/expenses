import * as PositionType from '../enums/PositionType.js';

import Database, { DbContext, useDataVersion } from "./Database.js";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { computeMonthlyAmountChf, createEmptyPosition } from "../utils/positions.js";
import { decrementMonth, getFirstDayOfMonth, incrementMonth, isSameDay, toYmd } from '../utils/dates.js';
import { deletePosition, getPositionsOfMonth, loadPosition, storePosition } from "../services/PositionService.js";

import Calendar from './Calendar.js';
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

function MonthDisplayComponent({ monthDisplay, date, setDate, dailyBudget, daysOfMonth, incomePositions, recurringPositions, expensePositions, editPosition, positionsByDay }) {
    switch (monthDisplay) {
        case MonthDisplay.OVERVIEW.id:
        default:
            return <Overview
                incomePositions={incomePositions}
                recurringPositions={recurringPositions}
                expensePositions={expensePositions}
                editPosition={editPosition} />
        case MonthDisplay.CALENDAR.id:
            return <Calendar date={date} setDate={setDate} positionsByDay={positionsByDay} />
        case MonthDisplay.CHART.id:
            return <MonthChart
                date={date}
                dailyBudget={dailyBudget}
                daysOfMonth={daysOfMonth}
                setDate={setDate}
                positionsByDay={positionsByDay} />;
    }
}

function computeData(positionsOfMonth, daysOfMonth) {
    const positionsLabeled = _.map(positionsOfMonth, pos => ({
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

    const incomePositions = overviewSections[OverviewSections.INCOME.id] || { monthlyAmountChf: '0', childRows: [] };
    const recurringPositions = overviewSections[OverviewSections.RECURRING.id] || { monthlyAmountChf: '0', childRows: [] };
    const expensePositions = overviewSections[OverviewSections.EXPENSE.id] || { monthlyAmountChf: '0', childRows: [] };

    const dailyBudget = (incomePositions.monthlyAmountChf - recurringPositions.monthlyAmountChf) / daysOfMonth.length;

    const positionsByDay = _(positionsLabeled)
        .filter(pos => !pos.recurring)
        .groupBy(pos => toYmd(pos.date))
        .map((positions, ymd) => {
            const byType = _.groupBy(positions, 'type');
            const expensesSum = _.sumBy(byType[PositionType.EXPENSE], 'monthlyAmountChf');

            return {
                ymd,
                expensesSum,
                earningsSum: _.sumBy(byType[PositionType.INCOME], 'monthlyAmountChf'),
                saved: dailyBudget - expensesSum,
                positions
            };
        })
        .keyBy('ymd')
        .value();

    for (const ymd of daysOfMonth) {
        if (positionsByDay[ymd]) {
            continue;
        }
        positionsByDay[ymd] = {
            ymd,
            expensesSum: 0,
            earningsSum: 0,
            saved: dailyBudget,
            positions: []
        };
    }

    return { incomePositions, recurringPositions, expensePositions, positionsByDay, dailyBudget };
}

// TODO loading-Zustände beim wechseln des Monats
// TODO zwischen "s" und "md" könnte man den navbar-container hier nicht-fluid machen weil das Form es nicht ist
export default function PositionOutline({ unsyncedDocuments, monthDisplay, setMonthDisplay, isSidebarCollapsed, toggleSidebar }) {
    const [date, setDate] = useState(new Date());
    const [editedPosition, setEditedPosition] = useState(null);
    const [positionsOfMonth, setPositionsOfMonth] = useState({});
    const { dataVersion, incrementDataVersion } = useDataVersion();

    const daysOfMonth = useMemo(() => {
        const month = date.getMonth();
        const daysOfMonth = [];
        for (const currentDay = getFirstDayOfMonth(date)
            ; currentDay.getMonth() === month
            ; currentDay.setDate(currentDay.getDate() + 1)) {

            daysOfMonth.push(toYmd(currentDay));
        }
        return daysOfMonth;
    }, [date]);

    const { incomePositions, recurringPositions, expensePositions, positionsByDay, dailyBudget } = useMemo(() => computeData(positionsOfMonth, daysOfMonth), [positionsOfMonth, daysOfMonth]);

    const db = useContext(DbContext);
    const queryCallback = useCallback(async db => {
        const positions = await getPositionsOfMonth(db, date);
        setPositionsOfMonth(_.keyBy(positions, '_id'));
    }, [date]);

    const newPosition = d => setEditedPosition(createEmptyPosition(d));
    const editPosition = async id => setEditedPosition(await loadPosition(db, id));

    const saveAction = useCallback(async pos => {
        setEditedPosition(null);
        pos.createDate = pos.createDate || new Date();
        storePosition(db, pos);
        incrementDataVersion();
    }, [setEditedPosition, db, incrementDataVersion]);

    const deleteAction = useCallback(async id => {
        setEditedPosition(null);
        const position = positionsOfMonth[id];
        deletePosition(db, position);
        incrementDataVersion();
    }, [setEditedPosition, positionsOfMonth, db, incrementDataVersion]);

    const dayPositions = !positionsByDay
        ? { ymd: toYmd(date), positions: null }
        : positionsByDay[toYmd(date)] || { ymd: toYmd(date), positions: [] };

    // TODO prüfen wie es mit dem footer weitergehen soll
    return (
        <Database.LiveQuery queryCallback={queryCallback} dataVersion={dataVersion}>
            <Outline
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
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
                    setDate={setDate}
                    dailyBudget={dailyBudget}
                    daysOfMonth={daysOfMonth}
                    incomePositions={incomePositions}
                    recurringPositions={recurringPositions}
                    expensePositions={expensePositions}
                    editPosition={editPosition}
                    positionsByDay={positionsByDay} />}
                sideOnMobile={MonthDisplay[monthDisplay].sideOnMobile}
                side={<DayPositions dayPositions={dayPositions} newPosition={newPosition} editPosition={editPosition} />}
                rightDrawer={editedPosition ? <PositionForm
                    key={editedPosition._id}
                    position={editedPosition}
                    saveAction={saveAction}
                    abortAction={() => setEditedPosition(null)}
                    deleteAction={deleteAction} /> : null}
                rightDrawerVisible={!!editedPosition}
                footerContent={<>
                    <div className="me-auto">
                        {Object.values(MonthDisplay).map(md => <button type="button" key={md.id} className={`btn ${md.id === monthDisplay ? 'active' : ''}`} onClick={() => setMonthDisplay(md.id)}><i className={`bi bi-${md.icon}`} /></button>)}
                    </div>
                    <>
                        <button type="button" className="btn btn-primary" onClick={() => newPosition(date)}><i className="bi bi-plus-square" />&nbsp;{t('New')}</button>
                    </>
                </>} />
        </Database.LiveQuery>
    );
}
