import React from 'react';
import formats from '../utils/formats';
import { isSubCent } from '../utils/amounts';

export default function Heading(props) {
    let amountStr = '';
    if (props.amount && !isSubCent(props.amount)) {
        amountStr = formats.float(Math.abs(props.amount));
        if (props.amount < 0) {
            amountStr = '+' + amountStr;
        }
    }

    return React.createElement(props.level, { className: 'd-flex' }, (<>
        <span className="me-auto">{props.label}</span>
        <span className={props?.amount < 0 ? 'text-success' : ''}>{amountStr}</span>
        <span className="currency"></span>
    </>));
};
