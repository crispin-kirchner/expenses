import React, { useEffect, useState } from 'react';

import Heading from './Heading';
import PositionRow from './PositionRow';
import { formatDayHeadingDate } from '../utils/formats';
import t from '../utils/texts';

function DayExpensesBody({ dayPositions, newPosition, editPosition, date }) {
    if (dayPositions.positions === null) {
        return (
            <div className='placeholder-glow'>
                <div className='d-flex border-top p-1'>
                    <span className='placeholder rounded me-auto col-7' />
                    <span className='placeholder rounded col-2' />
                    <span className='placeholder rounded col-1 ms-1' />
                </div>
                <div className='d-flex border-top p-1'>
                    <span className='placeholder rounded me-auto col-6' />
                    <span className='placeholder rounded col-3' />
                    <span className='placeholder rounded col-1 ms-1' />
                </div>
            </div>
        );
    }
    if (dayPositions.positions.length === 0) {
        // TODO linksbündig, Neu-Button dazu rechts
        return (
            <h5 className='text-center text-secondary border-top pt-2 cursor-pointer' onClick={() => newPosition(date)}>
                <i className="bi bi-piggy-bank-fill" />
                &emsp;{t('NoExpenses')}
            </h5>
        );
    }
    return dayPositions.positions.map(p => <PositionRow
        key={p._id}
        description={p.description}
        amount={p.amount}
        currency={p.currency}
        emphasizeIncome={true}
        onClick={() => editPosition(p._id)} />);
}

export default function DayExpenses({ dayExpenses: dayPositions, newPosition, editPosition }) {
    const date = new Date(dayPositions.ymd);
    return (<>
        <Heading level="h5" label={formatDayHeadingDate(date)} amount={dayPositions?.sum} />
        <DayExpensesBody dayPositions={dayPositions} newPosition={newPosition} editPosition={editPosition} date={date} />
    </>);
};
