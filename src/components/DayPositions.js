import Heading from './Heading';
import PositionRow from './PositionRow';
import React from 'react';
import _ from 'lodash';
import { formatDayHeadingDate } from '../utils/formats';
import t from '../utils/texts';

function DayPositionsBody({ dayPositions, newPosition, editPosition, date }) {
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
        return (
            <h5 className='text-center text-secondary border-top pt-2 cursor-pointer' onClick={() => newPosition(date)}>
                <i className="bi bi-piggy-bank-fill" />
                &emsp;{t('NoExpenses')}
            </h5>
        );
    }
    return _.orderBy(dayPositions.positions, 'createDate')
        .map(p => <PositionRow
            key={p._id}
            description={p.description}
            amount={p.amount}
            currency={p.currency}
            emphasizeIncome={true}
            onClick={() => editPosition(p._id)} />);
}

export default function DayPositions({ dayPositions, newPosition, editPosition }) {
    const date = new Date(dayPositions.ymd);
    return (<>
        <Heading level="h5" label={formatDayHeadingDate(date)} amount={dayPositions?.sum} />
        <DayPositionsBody dayPositions={dayPositions} newPosition={newPosition} editPosition={editPosition} date={date} />
    </>);
};
