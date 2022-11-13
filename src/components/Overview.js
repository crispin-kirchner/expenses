import React, { useContext } from 'react';

import OverviewSections from '../enums/OverviewSections';
import PositionRow from './PositionRow';
import TagContext from './TagContext';
import TagDimension from '../enums/TagDimension';
import _ from 'lodash';
import { computeMonthlyAmount } from '../utils/positions';
import { isDefaultCurrency } from '../enums/currencies';
import { removeTagFromString } from '../utils/tags';
import t from '../utils/texts';

// TODO Amounts von income negativ in DB schreiben
function Hierarchy(props) {
    // FIXME wenn der MOnat gewechselt wird sieht was nicht ganz koscher aus mit den chevrons
    const containerId = ['child-items', ...props.path].join('-');
    const hasChildren = props.childRows && props.childRows.length > 0;
    // FIXME positionRow nicht brauchen hier, zu viele Anpassungen nur für diese Stelle
    return (
        <li className={!hasChildren ? 'leaf-entry' : ''}>
            <PositionRow
                description={props.description}
                amount={props.amount}
                currency={props.currency}
                loading={props.loading}
                classes='p-1 btn text-light collapsed'
                onClick={props.editPosition && !hasChildren ? async () => props.editPosition(props.id) : null}
                attributes={{ 'data-bs-toggle': 'collapse', 'data-bs-target': `#${containerId}` }} />
            {hasChildren
                ? <ul className="chevron collapse" id={containerId}>
                    {props.childRows.map(row => (
                        <Hierarchy
                            key={row._id}
                            id={row._id}
                            description={row.description}
                            currency={row.currency}
                            amount={row.currency && !isDefaultCurrency(row.currency) ? computeMonthlyAmount(row) : row.monthlyAmountChf}
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

// FIXME cleanup, remove code from PositionService
// FIXME DayExpenses flicken
// FIXME profilern
function groupAndSort(childRows, tagHierarchy) {
    let result = _(childRows);

    const orderIteratees = ['monthlyAmountChf'];
    const orders = ['desc'];

    if (tagHierarchy) {
        result = result.groupBy(row => {
            const groupName = _.findKey(tagHierarchy[TagDimension.STANDARD], (_, tag) => row.tags.includes(tag));
            if (groupName) {
                return '#' + groupName;
            }
            return 'Sonstige'; // FIXME in Konstante auslagern / übersetzen
        })
            .map((positions, groupName) => {
                let childRows = positions;
                let _id = groupName;
                if (groupName[0] === '#') {
                    _id = groupName.substring(1);
                    childRows = _.map(childRows, pos => ({ ...pos, description: removeTagFromString(_id, pos.description) }));
                }
                childRows = _.orderBy(childRows, ['monthlyAmountChf'], ['desc']);
                return {
                    _id,
                    monthlyAmountChf: _.sumBy(positions, 'monthlyAmountChf'),
                    description: groupName,
                    childRows
                };
            })
        orderIteratees.unshift(row => row._id === 'Sonstige' ? 1 : -1);
        orders.unshift('asc');
    }

    return result.orderBy(orderIteratees, orders)
        .value();
}

export default function Overview(props) {
    const remainderLoaded = props.incomePositions.monthlyAmountChf && props.recurringPositions.monthlyAmountChf && props.expensePositions.monthlyAmountChf;
    const remainderAmount = remainderLoaded
        ? props.incomePositions.monthlyAmountChf - props.recurringPositions.monthlyAmountChf - props.expensePositions.monthlyAmountChf
        : 2500;

    // FIXME tags als prop?
    const tags = useContext(TagContext);

    return <>
        <OverviewSection
            id={OverviewSections.INCOME.id}
            description={t('Earnings')}
            amount={-props.incomePositions.monthlyAmountChf || 10000}
            loading={!props.incomePositions.monthlyAmountChf}
            childRows={groupAndSort(props.incomePositions.childRows, tags?.hierarchy)}
            editPosition={props.editPosition} />

        <OverviewSection
            id={OverviewSections.RECURRING.id}
            description={t('Recurring')}
            amount={props.recurringPositions.monthlyAmountChf || 2500}
            loading={!props.recurringPositions.monthlyAmountChf}
            childRows={groupAndSort(props.recurringPositions.childRows, tags?.hierarchy)}
            editPosition={props.editPosition} />

        <OverviewSection
            id={OverviewSections.EXPENSE.id}
            description={t('Expenses')}
            amount={props.expensePositions.monthlyAmountChf || 900}
            loading={!props.expensePositions.monthlyAmountChf}
            childRows={groupAndSort(props.expensePositions.childRows, tags?.hierarchy)}
            editPosition={props.editPosition} />

        <OverviewSection
            id={OverviewSections.REMAINING.id}
            description={t('Remaining')}
            amount={remainderAmount}
            loading={!remainderLoaded}
            childRows={[]} />
    </>;
};
