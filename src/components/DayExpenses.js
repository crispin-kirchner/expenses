import React, { useEffect, useState } from 'react';

import Heading from './Heading';
import PositionRow from './PositionRow';
import formats from '../utils/formats';
import { getDayExpenses } from '../services/PositionService.js';

function DayExpensesBody(props) {
    if (props.dayExpenses === null) {
        return <>Loading...</>;
    }
    if (props.dayExpenses.expenses.length === 0) {
        return <>No expenses</>;
    }
    return props.dayExpenses.expenses.map(p => <PositionRow key={p._id} pos={p} emphasizeIncome={true} />);
}

// FIXME display sum
export default function DayExpenses(props) {
    const [dayExpenses, setDayExpenses] = useState(null);
    useEffect(() => {
        getDayExpenses(props.date)
            .then(data => setDayExpenses(data));
    }, [props.date]);

    return (<>
        <Heading level="h5" label={formats.dayHeadingDate(props.date)} amount={dayExpenses?.sum} />
        <DayExpensesBody dayExpenses={dayExpenses} />
    </>);
};
