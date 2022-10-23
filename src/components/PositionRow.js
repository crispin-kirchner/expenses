import * as PositionType from '../enums/PositionType.js';
import * as positions from '../utils/positions.js';

import React, { useContext } from 'react';
import currencies, { isDefaultCurrency } from '../enums/currencies.js';

import { TAG_REGEX } from '../utils/tags.js';
import TagContext from './TagContext.js';
import colors from '../enums/colors.js';
import formats from '../utils/formats.js';

function Tag(props) {
    const tags = useContext(TagContext);
    let classes = props.classes || '';
    if (tags) {
        const tag = tags.flat[props.name];
        classes += colors[tag.color].classes;
    }
    else {
        // FIXME prüfen wo es diesen default color noch braucht und vereinheitlichen
        classes += colors['grayWhite'].classes;
    }
    return (
        <span
            className={`badge ${classes}`}
            data-xpns-tag={props.name}>
            {props.name}
        </span>)
        ;
}

function PositionDescription(props) {
    const parts = [];
    for (let i = 0, m; (m = TAG_REGEX.exec(props.text)); ++i) {
        if (i === 0 && m.index > 0) {
            parts.push(props.text.substring(0, m.index).trim());
        }
        parts.push(<Tag key={i} name={m[1]} />);
        ++i;
    }
    if (parts.length === 0) {
        parts.push(props.text);
    }

    const wrapperFunction = props.wrapperFunction || (x => x);
    return parts.map(wrapperFunction);
}

export default function PositionRow(props) {
    const classes = props.classes || 'py-1 border-top xpns-hover';
    let label = props.pos.description;
    const amountClasses = props.emphasizeIncome && props.pos.type === PositionType.INCOME ? 'text-success' : '';
    return React.createElement('div', {
        "data-xpns-id": props.pos._id,
        className: `d-flex cursor-pointer ${classes || ''}`,
        ...props.attributes
    }, (<>
        <span className="d-flex overflow-hidden text-nowrap me-auto">
            {props.children}
            <PositionDescription text={label} wrapperFunction={(el, i) => <div key={i} className="overflow-hidden me-1">{el}</div>} />
        </span>
        {props.pos.amountLoading
            ? <span className="placeholder-wave placeholder rounded" style={{ width: `${props.pos.amountLoading}em` }} />
            : <span className={`pe-1 text-end ${amountClasses}`}>
                {props.pos.type === PositionType.INCOME ? '+' : ''}
                {formats.float(positions.computeMonthlyAmount(props.pos))}
            </span>}
        <span className={`currency ${amountClasses}`}>
            {isDefaultCurrency(props.pos.currency) ? '' : currencies[props.pos.currency].displayName}
        </span>
    </>));
}
