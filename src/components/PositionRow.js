import * as PositionType from '../enums/PositionType.js';
import * as positions from '../utils/positions.js';

import currencies, { isDefaultCurrency } from '../enums/currencies.js';

import React from 'react';
import formats from '../utils/formats.js';

// FIXME Tags dekorieren
export default function PositionRow(props) {
    const classes = props.classes || 'py-1 border-top xpns-hover';
    let label = props.pos.description;
    /*let label = labels.decorateTags(pos.description, l => `<div class="overflow-hidden me-1">${l}</div>`);
    if (options?.labelFormatter) {
        label = options.labelFormatter(label);
    }*/
    const amountClasses = props.emphasizeIncome && props.pos.type === PositionType.INCOME ? 'text-success' : '';
    return React.createElement('div', {
        "data-xpns-id": props.pos._id,
        className: `d-flex cursor-pointer ${classes || ''}`,
        ...props.attributes
    }, (<>
        <span className="d-flex overflow-hidden text-nowrap me-auto">
            {label}
        </span>
        <span className={`pe-1 text-end ${amountClasses}`}>
            {props.pos.type === PositionType.INCOME ? '+' : ''}
            {formats.float(positions.computeMonthlyAmount(props.pos))}
        </span>
        <span className={`currency ${amountClasses}`}>
            {isDefaultCurrency(props.pos.currency) ? '' : currencies[props.pos.currency].displayName}
        </span>
    </>));
}
