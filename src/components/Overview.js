import React, { useContext, useMemo, useState } from 'react';
import { getLastDayOfMonth, toYmd } from '../utils/dates';

import Collapse from 'react-bootstrap/Collapse';
import EntityType from '../enums/EntityType';
import OverviewSections from '../enums/OverviewSections';
import OverviewTreemap from './OverviewTreemap';
import PositionRow from './PositionRow';
import TagContext from './TagContext';
import TagDimension from '../enums/TagDimension';
import _ from 'lodash';
import { computeMonthlyAmount } from '../utils/positions';
import { isDefaultCurrency } from '../enums/currencies';
import { removeTagFromString } from '../utils/tags';
import t from '../utils/texts';

function Hierarchy({ id, entity, path, childRows, description, amount, currency, loading, editPosition }) {
    const [open, setOpen] = useState(false);
    const hasChildren = childRows && childRows.length > 0;
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

function OverviewSection({ section, className, amount, loading, childRows, editPosition }) {
    return (
        <div className={`bg-dark text-light rounded p-2 mt-2 ${className ? className : ''}`}>
            <ul className="chevron m-0 ps-0">
                <Hierarchy
                    id={section.id}
                    type="section"
                    description={section.name}
                    amount={amount}
                    loading={loading}
                    path={[section.id]}
                    childRows={childRows || []}
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

// TODO beim Monatswechsel zuckt es
export default function Overview({ date, incomePositions, recurringPositions, expensePositions, editPosition, positionsByDay }) {
    const savedLoaded = positionsByDay && Object.keys(positionsByDay).length > 0;
    const today = toYmd(new Date());
    const lastDayOfMonth = toYmd(getLastDayOfMonth(date));
    const monthInProgress = today <= lastDayOfMonth;
    let savedAmount = 900;
    if (savedLoaded) {
        savedAmount = monthInProgress
            ? positionsByDay[today].savedCumulative
            : positionsByDay[lastDayOfMonth].savedCumulative;
    }

    const remainderLoaded = savedLoaded && incomePositions.monthlyAmountChf && recurringPositions.monthlyAmountChf && expensePositions.monthlyAmountChf;
    const remainderAmount = remainderLoaded
        ? incomePositions.monthlyAmountChf - recurringPositions.monthlyAmountChf - expensePositions.monthlyAmountChf - savedAmount
        : 2500;

    // TODO bei saved und remainder cursor-pointer verhindern

    const tags = useContext(TagContext);

    const expensesChildRows = useMemo(() => groupByTagAndSort(expensePositions.childRows, tags?.hierarchy), [expensePositions, tags]);

    return <div className='p-md-2'>
        <OverviewTreemap tags={tags} expensesChildRows={expensesChildRows} savedAmount={savedAmount} remainderAmount={remainderAmount} />

        <OverviewSection
            section={OverviewSections.INCOME}
            amount={incomePositions.monthlyAmountChf ? -incomePositions.monthlyAmountChf : 10000}
            loading={!incomePositions.monthlyAmountChf}
            childRows={groupByTagAndSort(incomePositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            section={OverviewSections.RECURRING}
            amount={recurringPositions.monthlyAmountChf || 2500}
            loading={!recurringPositions.monthlyAmountChf}
            childRows={groupByTagAndSort(recurringPositions.childRows, tags?.hierarchy)}
            editPosition={editPosition} />

        <OverviewSection
            section={OverviewSections.EXPENSE}
            amount={expensePositions.monthlyAmountChf || 900}
            loading={!expensePositions.monthlyAmountChf}
            childRows={expensesChildRows}
            editPosition={editPosition} />

        <OverviewSection
            section={OverviewSections.SAVED}
            description={OverviewSections.SAVED.name}
            amount={savedAmount}
            loading={!savedLoaded} />

        {monthInProgress ? <OverviewSection
            section={OverviewSections.REMAINING}
            className="mb-2"
            amount={remainderAmount}
            loading={!remainderLoaded} /> : null}
    </div>;
};
