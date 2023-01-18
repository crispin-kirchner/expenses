import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import OverviewSections from '../enums/OverviewSections';
import { formatInteger } from '../utils/formats';
import t from '../utils/texts';
import { useMemo } from 'react';

ChartJS.register(TreemapController, TreemapElement);

function computeExpensesData(expensesChildRows) {
    return expensesChildRows.map(r => ({
        monthlyAmountChf: r.monthlyAmountChf,
        tag: r.type === 'misc' ? t('Miscellaneous') : r._id,
        section: OverviewSections.EXPENSE.name
    }));
}

// TODO colors, hover
// TODO nach dem erstellen einer neuen Ausgabe sah es komisch aus
export default function OverviewTreemap({ expensesChildRows, remainderAmount }) {
    const data = useMemo(() => ({
        datasets: [{
            tree: [
                ...computeExpensesData(expensesChildRows),
                { monthlyAmountChf: remainderAmount, section: OverviewSections.REMAINING.name }],
            groups: ['section', 'tag'],
            key: 'monthlyAmountChf',
            borderWidth: 1,
            borderRadius: 7,
            captions: {
                align: 'center'
            },
            labels: {
                display: true,
                formatter: (ctx) => ctx.raw.g ? [ctx.raw.g, formatInteger(ctx.raw.v)] : formatInteger(ctx.raw.v),
            }
        }]
    }), [expensesChildRows, remainderAmount]);

    const options = useMemo(() => ({
        plugins: {
            tooltip: {
                enabled: false
            }
        }
    }), []);

    return <Chart type="treemap" data={data} options={options} />;
}
