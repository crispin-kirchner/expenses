import * as colors from './colors.js';
import * as expenses from './expenses.js';
import * as expensesApp from './App.js';
import * as labels from './labels.js';

import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

import { Chart } from 'chart.js';

Chart.register(TreemapController, TreemapElement);

function getOverviewTreemap() {
    return document.getElementById('overview-treemap');
}

function render() {
    return `
        <div>
            <canvas id="overview-treemap"></canvas>
        </div>`;
}

function addPath(treemapRow, path, row) {
    if (path.length === 0 && row.childRows.length === 0) {
        path = [row];
    }
    for (let i = 0; i < path.length; ++i) {
        treemapRow['path' + i] = path[i].title;
    }
}

function transformToTreemapData() {
    const result = [];
    let maxLevel = 0;
    expenses.visitOverviewData((row, path) => {
        if (path.length === 0 && (row.id === 'income' || row.id === 'recurring')) {
            return 'discard';
        }
        if (row.childRows.length > 0) {
            return 'continue';
        }
        const treemapRow = {
            amountChf: row.amountChf
        };
        addPath(treemapRow, path, row);
        result.push(treemapRow);
        maxLevel = Math.max(maxLevel, path.length);
        return 'continue';
    });

    const groups = [];
    for (let i = 0; i < maxLevel; ++i) {
        groups.push('path' + i);
    }

    return [result, groups];
}

function getLastPathComponent(treemapRow) {
    let maxIndex = 0;
    let hasMatch = false;
    for (const [key, value] of Object.entries(treemapRow)) {
        if (!value) {
            continue;
        }
        const execResult = /path([0-9]+)/.exec(key);
        if (execResult === null) {
            continue;
        }
        hasMatch = true;
        maxIndex = Math.max(maxIndex, parseInt(execResult[1]));
    }
    return hasMatch ? [maxIndex, treemapRow['path' + maxIndex]] : null;
}

function getColor(colorType, alpha, ctx) {
    if (ctx.type !== 'data') {
        return;
    }
    const isCaption = ctx.raw._data.path1 === undefined;
    let colorName = 'blackWhite';
    if (isCaption && colorType === 'border') {
        colorName = 'whiteBlack';
    }
    if (!isCaption) {
        const [index, lastPathComponent] = getLastPathComponent(ctx.raw._data);
        if (index === 0) {
            colorName = 'grayWhite';
        }
        else {
            const label = labels.getByName(lastPathComponent);
            colorName = label.color;
        }
    }

    if (colorType === 'border') {
        colorType = 'foreground';
    }

    const color = colors.get(colorName);
    return `rgb(${color[colorType].rgb}, ${alpha})`;
}

function onAttach() {
    const [data, groups] = transformToTreemapData();

    new Chart(getOverviewTreemap(), {
        type: 'treemap',
        data: {
            datasets: [{
                label: 'Übersicht',
                tree: data,
                key: 'amountChf',
                groups: groups,
                borderWidth: 1,
                backgroundColor: (ctx) => getColor('background', 1, ctx),
                borderColor: (ctx) => getColor('border', 1, ctx),
                captions: {
                    color: (ctx) => getColor('foreground', 1, ctx),
                    align: 'center'
                },
                labels: {
                    display: true,
                    formatter: (ctx) => ctx.raw.g ? [ctx.raw.g, expensesApp.renderFloat(ctx.raw.v)] : expensesApp.renderFloat(ctx.raw.v),
                    color: (ctx) => getColor('foreground', 1, ctx)
                }
            }]
        },
        options: {
            plugins: {
                tooltip: {
                    enabled: false
                }
            }
        }
    });
}

export { render, onAttach };
