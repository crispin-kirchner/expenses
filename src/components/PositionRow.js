import * as PositionType from '../enums/PositionType.js';
import * as positions from '../utils/positions.js';

import React, { useContext } from 'react';
import currencies, { isDefaultCurrency } from '../enums/currencies.js';

import { TAG_REGEX } from '../utils/tags.js';
import TagContext from './TagContext.js';
import colors from '../enums/colors.js';
import { formatFloat } from '../utils/formats.js';
import { loadPosition } from '../services/PositionService.js';

function Tag(props) {
    const tags = useContext(TagContext);
    let classes = props.classes || '';
    let tag = null;
    if (tags && (tag = tags.flat[props.name])) {
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
    const amountClasses = props.emphasizeIncome && props.amount < 0 ? 'text-success' : '';
    const multiplier = props.amount < 0 ? -1 : 1;
    return React.createElement('div', {
        onClick: props.onClick,
        className: `d-flex cursor-pointer ${classes}`,
        ...props.attributes
    }, (<>
        <span className="d-flex overflow-hidden text-nowrap me-auto">
            {props.children}
            <PositionDescription text={props.description} wrapperFunction={(el, i) => <div key={i} className="overflow-hidden me-1">{el}</div>} />
        </span>
        {props.loading
            ? <span className="placeholder-wave placeholder rounded" style={{ width: `${Math.log10(props.amount) + 2}rem` }} />
            : <span className={`pe-1 text-end ${amountClasses}`}>
                {props.amount < 0 ? '+' : ''}
                {formatFloat(props.amount * multiplier)}
            </span>}
        <span className={`currency ${amountClasses}`}>
            {props.currency}
        </span>
    </>));
}
