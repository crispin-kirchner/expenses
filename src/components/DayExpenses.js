import React, { useEffect, useState } from 'react';

import Heading from './Heading';
import PositionRow from './PositionRow';
import formats from '../utils/formats';
import { getDayExpenses } from '../services/PositionService.js';
import t from '../utils/texts';

function DayExpensesBody(props) {
    if (props.dayExpenses === null) {
        return (
            <div className='placeholder-glow'>
                <div className='d-flex border-top p-1'>
                    <span className='placeholder me-auto col-7' />
                    <span className='placeholder col-2' />
                    <span className='placeholder col-1 ms-1' />
                </div>
                <div className='d-flex border-top p-1'>
                    <span className='placeholder me-auto col-6' />
                    <span className='placeholder col-3' />
                    <span className='placeholder col-1 ms-1' />
                </div>
            </div>
        );
    }
    if (props.dayExpenses.expenses.length === 0) {
        // TODO beim draufklicken neue Ausgabe machen
        return (
            <h5 className='text-center text-secondary border-top pt-2'>
                <i className="bi bi-piggy-bank-fill" />
                &emsp;{t('NoExpenses')}
            </h5>
        );
    }
    return props.dayExpenses.expenses.map(p => <PositionRow key={p._id} pos={p} emphasizeIncome={true} />);
}

export default function DayExpenses(props) {
    const [dayExpenses, setDayExpenses] = useState(null);
    useEffect(() => {
        setDayExpenses(null);
        getDayExpenses(props.date)
            .then(data => setDayExpenses(data));
    }, [props.date]);

    return (<>
        <Heading level="h5" label={formats.dayHeadingDate(props.date)} amount={dayExpenses?.sum} />
        <DayExpensesBody dayExpenses={dayExpenses} />
    </>);
};
