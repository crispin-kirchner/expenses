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

function Hierarchy(props) {
    // FIXME wenn der MOnat gewechselt wird sieht was nicht ganz koscher aus mit den chevrons
    const containerId = ['child-items', ...props.path].join('-');
    const hasChildren = props.childRows && props.childRows.length > 0;
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

function OverviewSection({ id, className, description, amount, loading, childRows, editPosition }) {
    return (
        <div className={`bg-dark text-light rounded p-2 mt-2 ${className ? className : ''}`}>
            <ul className="chevron m-0 ps-0">
                <Hierarchy
                    id={id}
                    description={description}
                    amount={amount}
                    loading={loading}
                    path={[id]}
                    childRows={childRows}
                    editPosition={editPosition} />
            </ul>
        </div>
    );
}

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

export default function Overview({ incomePositions, recurringPositions, expensePositions, editPosition }) {
    const remainderLoaded = incomePositions.monthlyAmountChf && recurringPositions.monthlyAmountChf && expensePositions.monthlyAmountChf;
    const remainderAmount = remainderLoaded
        ? incomePositions.monthlyAmountChf - recurringPositions.monthlyAmountChf - expensePositions.monthlyAmountChf
        : 2500;

    const tags = useContext(TagContext);

    return <>
        <OverviewSection
            id={OverviewSections.INCOME.id}
            description={t('Earnings')}
            amount={incomePositions.monthlyAmountChf ? -incomePositions.monthlyAmountChf : 10000}
            loading={!incomePositions.monthlyAmountChf}
            childRows={groupAndSort(incomePositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            id={OverviewSections.RECURRING.id}
            description={t('Recurring')}
            amount={recurringPositions.monthlyAmountChf || 2500}
            loading={!recurringPositions.monthlyAmountChf}
            childRows={groupAndSort(recurringPositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            id={OverviewSections.EXPENSE.id}
            description={t('Expenses')}
            amount={expensePositions.monthlyAmountChf || 900}
            loading={!expensePositions.monthlyAmountChf}
            childRows={groupAndSort(expensePositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            id={OverviewSections.REMAINING.id}
            className="mb-2"
            description={t('Remaining')}
            amount={remainderAmount}
            loading={!remainderLoaded}
            childRows={[]} />
    </>;
};
