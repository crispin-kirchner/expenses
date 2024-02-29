import currencies, { isDefaultCurrency } from '../enums/currencies.js';

import React from 'react';
import { TAG_REGEX } from '../utils/tags.js';
import TagPill from './TagPill.js';
import { formatFloat } from '../utils/formats.js';

function PositionDescription(props) {
  const parts = [];
  for (let i = 0, m; (m = TAG_REGEX.exec(props.text)); ++i) {
    if (i === 0 && m.index > 0) {
      parts.push(props.text.substring(0, m.index).trim());
    }
    parts.push(<TagPill key={i} name={m[1]} />);
    ++i;
  }
  if (parts.length === 0) {
    parts.push(props.text);
  }

  const wrapperFunction = props.wrapperFunction || (x => x);
  return parts.map(wrapperFunction);
}

export default function PositionRow({ classes, emphasizeIncome, amount, onClick, attributes, description, currency, loading, children }) {
  classes = classes || 'py-1 border-top xpns-hover';
  const amountClasses = emphasizeIncome && amount < 0 ? 'text-success' : '';
  const multiplier = amount < 0 ? -1 : 1;
  return React.createElement('div', {
    onClick: onClick,
    className: `d-flex cursor-pointer ${classes}`,
    ...attributes
  }, (<>
    <span className="d-flex overflow-hidden text-nowrap me-auto">
      {children}
      <PositionDescription text={description} wrapperFunction={(el, i) => <div key={i} className="overflow-hidden me-1">{el}</div>} />
    </span>
    {loading
      ? <span className="placeholder-wave placeholder rounded" style={{ width: `${Math.log10(amount) + 2}rem` }} />
      : <span className={`pe-1 text-end ${amountClasses}`}>
        {amount < 0 ? '+' : ''}
        {formatFloat(amount * multiplier)}
      </span>}
    <span className={`currency ${amountClasses}`}>
      {currency && !isDefaultCurrency(currency) ? currencies[currency].displayName : ''}
    </span>
  </>));
}
