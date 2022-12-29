import React, { useContext, useState } from 'react';

import Collapse from 'react-bootstrap/Collapse';
import EntityType from '../enums/EntityType';
import OverviewSections from '../enums/OverviewSections';
import PositionRow from './PositionRow';
import TagContext from './TagContext';
import TagDimension from '../enums/TagDimension';
import _ from 'lodash';
import { computeMonthlyAmount } from '../utils/positions';
import { isDefaultCurrency } from '../enums/currencies';
import { removeTagFromString } from '../utils/tags';
import t from '../utils/texts';

function Hierarchy({ id, entity, type, path, childRows, description, amount, currency, loading, editPosition }) {
    const [open, setOpen] = useState(false);
    const hasChildren = childRows && childRows.length > 0;
    // TODO wenn man eine expense auf macht und eine zweite anklickt, ändert sich das form nicht
    return (
        <li className={!hasChildren ? 'leaf-entry' : ''}>
            <PositionRow
                description={description}
                amount={amount}
                currency={currency}
                loading={loading}
                classes={`p-1 btn text-light ${hasChildren && open ? '' : 'collapsed'}`}
                onClick={editPosition && entity === EntityType.POSITION ? () => editPosition(id) : () => setOpen(o => !o)} />
            {hasChildren
                ? <Collapse in={open}>
                    <ul className="chevron">
                        {childRows.map(row => (
                            <Hierarchy
                                key={row._id}
                                id={row._id}
                                entity={row.entity}
                                type={row.type}
                                description={row.description}
                                currency={row.currency}
                                amount={row.currency && !isDefaultCurrency(row.currency) ? computeMonthlyAmount(row) : row.monthlyAmountChf}
                                path={[...path, row._id]}
                                childRows={row.childRows}
                                editPosition={editPosition} />
                        ))}
                    </ul>
                </Collapse>
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
                    type="section"
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

function groupByTagAndSort(childRows, tagHierarchy) {
    let result = _(childRows);

    const orderIteratees = ['monthlyAmountChf'];
    const orders = ['desc'];

    if (tagHierarchy) {
        result = result.groupBy(row => {
            const groupName = _.findKey(tagHierarchy[TagDimension.STANDARD], (_, tag) => row.tags.includes(tag));
            return groupName ? '#' + groupName : 'misc';
        })
            .map((positions, groupName) => {
                const isTag = groupName[0] === '#';
                const _id = isTag ? groupName.substring(1) : groupName;
                let childRows = positions;
                if (isTag) {
                    childRows = _.map(childRows, pos => ({ ...pos, description: removeTagFromString(_id, pos.description) }));
                }
                childRows = _.orderBy(childRows, ['monthlyAmountChf'], ['desc']);
                return {
                    _id,
                    type: isTag ? 'tag' : 'misc',
                    monthlyAmountChf: _.sumBy(positions, 'monthlyAmountChf'),
                    description: isTag ? groupName : t('Miscellaneous'),
                    childRows
                };
            })
        orderIteratees.unshift(row => row._id === 'misc' ? 1 : -1);
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
            childRows={groupByTagAndSort(incomePositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            id={OverviewSections.RECURRING.id}
            description={t('Recurring')}
            amount={recurringPositions.monthlyAmountChf || 2500}
            loading={!recurringPositions.monthlyAmountChf}
            childRows={groupByTagAndSort(recurringPositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            id={OverviewSections.EXPENSE.id}
            description={t('Expenses')}
            amount={expensePositions.monthlyAmountChf || 900}
            loading={!expensePositions.monthlyAmountChf}
            childRows={groupByTagAndSort(expensePositions.childRows, tags?.hierarchy)}
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
