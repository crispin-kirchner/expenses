import React, { useContext, useEffect, useState } from 'react';

import OverviewSections from '../enums/OverviewSections';
import PositionRow from './PositionRow';
import TagContext from './TagContext';
import { getDefaultCurrency } from '../enums/currencies';
import { getOverviewData } from '../services/PositionService';
import t from '../utils/texts';

// TODO Amounts von income negativ in DB schreiben
function Hierarchy(props) {
    // FIXME wenn der MOnat gewechselt wird sieht was nicht ganz koscher aus mit den chevrons
    const containerId = ['child-items', ...props.path].join('-');
    const hasChildren = props.childRows && props.childRows.length > 0;
    // FIXME PositionRow wegrefactoren, lieber beim gemeinsamen Nenner PositionDescription bleiben
    return (
        <li className={!hasChildren ? 'leaf-entry' : ''}>
            <PositionRow
                description={props.description}
                amount={props.amount}
                loading={props.loading}
                classes='p-1 btn text-light collapsed'
                onClick={!hasChildren ? async () => props.editPosition(props.id) : null}
                attributes={{ 'data-bs-toggle': 'collapse', 'data-bs-target': `#${containerId}` }} />
            {hasChildren
                ? <ul className="chevron collapse" id={containerId}>
                    {props.childRows.map(row => (
                        <Hierarchy
                            key={row._id}
                            id={row._id}
                            description={row.description}
                            amount={row.amount}
                            path={[...props.path, row._id]}
                            childRows={row.childRows}
                            editPosition={props.editPosition} />
                    ))}
                </ul>
                : null}
        </li>
    );
}

function OverviewSection(props) {
    return (
        <div className="bg-dark text-light rounded p-2 mt-2">
            <ul className="chevron m-0 ps-0">
                <Hierarchy
                    id={props.id}
                    description={props.description}
                    amount={props.amount}
                    loading={props.loading}
                    path={[props.id]}
                    childRows={props.childRows}
                    editPosition={props.editPosition} />
            </ul>
        </div>
    );
}

export default function Overview(props) {
    return <OverviewSection
        id={OverviewSections.EXPENSE.id}
        description={t('Earnings')}
        amount={-props.incomePositions.amount || 5000}
        loading={!props.incomePositions.amount}
        childRows={props.incomePositions.childRows}
        editPosition={props.editPosition} />
};
