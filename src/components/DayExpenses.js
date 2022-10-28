import React, { useEffect, useState } from 'react';

import Heading from './Heading';
import PositionRow from './PositionRow';
import { formatDayHeadingDate } from '../utils/formats';
import { getDayExpenses } from '../services/PositionService.js';
import t from '../utils/texts';

function DayExpensesBody(props) {
    if (props.dayExpenses === null) {
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
    if (props.dayExpenses.expenses.length === 0) {
        // TODO linksbündig, Neu-Button dazu rechts
        return (
            <h5 className='text-center text-secondary border-top pt-2 cursor-pointer' onClick={() => props.newPosition(props.date)}>
                <i className="bi bi-piggy-bank-fill" />
                &emsp;{t('NoExpenses')}
            </h5>
        );
    }
    return props.dayExpenses.expenses.map(p => <PositionRow
        key={p._id}
        description={p.description}
        amount={p.amount}
        currency={p.currency}
        emphasizeIncome={true}
        onClick={() => props.editPosition(p._id)} />);
}

export default function DayExpenses(props) {
    const [dayExpenses, setDayExpenses] = useState(null);
    useEffect(() => {
        setDayExpenses(null);
        getDayExpenses(props.date)
            .then(data => setDayExpenses(data));
    }, [props.date]);

    return (<>
        <Heading level="h5" label={formatDayHeadingDate(props.date)} amount={dayExpenses?.sum} />
        <DayExpensesBody dayExpenses={dayExpenses} newPosition={props.newPosition} editPosition={props.editPosition} />
    </>);
};
