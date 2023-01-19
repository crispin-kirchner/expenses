import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import OverviewSections from '../enums/OverviewSections';
import colors from '../enums/colors';
import { formatInteger } from '../utils/formats';
import t from '../utils/texts';
import { useMemo } from 'react';

ChartJS.register(TreemapController, TreemapElement);

function computeExpensesData(expensesChildRows) {
    return expensesChildRows.map(r => ({
        monthlyAmountChf: r.monthlyAmountChf,
        tag: r.type === 'misc' ? r._id : '#' + r._id,
        section: OverviewSections.EXPENSE.name
    }));
}

function getColor(tags, colorType, alpha, ctx) {
    if (!tags || ctx.type !== 'data' || !ctx.raw._data.tag || ctx.raw._data.tag.charAt(0) !== '#') {
        return colorType === 'foreground'
            ? 'rgb(0,0,0)'
            : 'rgb(0,0,0,0.1)';
    }
    colorType = colorType === 'border' ? 'foreground' : colorType;
    const tag = ctx.raw._data.tag.slice(1);
    const colorName = tags.flat[tag].color;
    const rgb = colors[colorName][colorType].rgb;
    return `rgb(${rgb}, ${alpha})`;
}

function formatLabel(ctx) {
    const v = formatInteger(ctx.raw.v);
    if (ctx.raw.g) {
        let g = ctx.raw.g;
        if (g.charAt(0) === '#') {
            g = g.slice(1);
        }
        else if (g === 'misc') {
            g = t('Miscellaneous');
        }
        return [g, v];
    }
    return v;
}

// TODO nach dem erstellen einer neuen Ausgabe sah es komisch aus
export default function OverviewTreemap({ tags, expensesChildRows, savedAmount, remainderAmount }) {
    const data = useMemo(() => ({
        datasets: [{
            tree: [
                ...computeExpensesData(expensesChildRows),
                { monthlyAmountChf: savedAmount, section: OverviewSections.SAVED.name },
                { monthlyAmountChf: remainderAmount, section: OverviewSections.REMAINING.name }],
            groups: ['section', 'tag'],
            key: 'monthlyAmountChf',
            borderWidth: 2,
            borderRadius: 7,
            backgroundColor: (ctx) => {
                return getColor(tags, 'background', 0.8, ctx);
            },
            borderColor: (ctx) => getColor(tags, 'border', 0.8, ctx),
            captions: {
                align: 'center'
            },
            labels: {
                display: true,
                formatter: formatLabel,
                color: (ctx) => getColor(tags, 'foreground', 1, ctx)
            }
        }]
    }), [tags, savedAmount, expensesChildRows, remainderAmount]);

    const options = useMemo(() => ({
        hover: {
            mode: null
        },
        plugins: {
            tooltip: {
                enabled: false
            }
        }
    }), []);

    return <Chart type="treemap" data={data} options={options} />;
}
