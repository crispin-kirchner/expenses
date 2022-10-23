import React, { useContext, useEffect, useState } from 'react';
import { getOverviewData, loadPosition } from '../services/PositionService';

import OverviewSections from '../enums/OverviewSections';
import PositionRow from './PositionRow';
import TagContext from './TagContext';
import { getDefaultCurrency } from '../enums/currencies';

function Hierarchy(props) {
    // FIXME wenn der MOnat gewechselt wird sieht was nicht ganz koscher aus mit den chevrons
    const containerId = ['child-items', ...props.path].join('-');
    const hasChildren = props.row.childRows && props.row.childRows.length > 0;
    return (
        <li className={!hasChildren ? 'leaf-entry' : ''}>
            <PositionRow
                onClick={!hasChildren ? async () => props.editPosition(props.row._id) : null}
                pos={props.row}
                classes='p-1 btn text-light collapsed'
                attributes={{ 'data-bs-toggle': 'collapse', 'data-bs-target': `#${containerId}` }} />
            {hasChildren
                ? <ul className="chevron collapse" id={containerId}>
                    {props.row.childRows.map(row => <Hierarchy key={row._id} row={row} path={[...props.path, row._id]} editPosition={props.editPosition} />)}
                </ul>
                : null}
        </li>
    );
}

function OverviewSection(props) {
    const row = props.overviewData !== null
        ? props.overviewData[props.section]
        : {
            _id: props.section,
            description: OverviewSections[props.section].name,
            currency: getDefaultCurrency().id,
            amountLoading: OverviewSections[props.section].loadingPlaceholder
        };
    return (
        <div className="bg-dark text-light rounded p-2 mt-2">
            <ul className="chevron m-0 ps-0">
                <Hierarchy row={row} path={[row._id]} editPosition={props.editPosition} />
            </ul>
        </div>
    );
}

export default function Overview(props) {
    const tags = useContext(TagContext);
    const [overviewData, setOverviewData] = useState(null);
    useEffect(() => {
        setOverviewData(null);
        getOverviewData(props.date, tags)
            .then(setOverviewData);
    }, [props.date, tags]);

    return Object.values(OverviewSections)
        .sort((a, b) => a.order - b.order)
        .map(sec => <OverviewSection key={sec.id} overviewData={overviewData} editPosition={props.editPosition} section={sec.id} />);
};
