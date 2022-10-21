import React, { useContext, useEffect, useState } from 'react';

import OverviewSections from '../enums/OverviewSections';
import PositionRow from './PositionRow';
import TagContext from './TagContext';
import { getDefaultCurrency } from '../enums/currencies';
import { getOverviewData } from '../services/PositionService';

function SubHierarchy(props) {
    if (!props.childRows || props.childRows.length === 0) {
        return;
    }
    // FIXME prüfen ob es das expanded gedöns braucht (isExpanded(containerId) ? 'show' : '')
    return (
        <ul className="chevron collapse" id={props.containerId}>
            {props.childRows.map(row => <Hierarchy key={row._id} row={row} path={[...props.path, row._id]} />)}
        </ul>
    );
}

function Hierarchy(props) {
    const containerId = ['child-items', ...props.path].join('-');
    return (
        <li className={!props.row.childRows || props.row.childRows.length === 0 ? 'leaf-entry' : ''}>
            <PositionRow
                pos={props.row}
                classes='p-1 btn text-light collapsed'
                attributes={{ 'data-bs-toggle': 'collapse', 'data-bs-target': `#${containerId}` }} />
            <SubHierarchy childRows={props.row.childRows} path={props.path} containerId={containerId} />
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
                <Hierarchy row={row} path={[row._id]} />
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
        .map(sec => <OverviewSection key={sec.id} overviewData={overviewData} section={sec.id} />);
};
