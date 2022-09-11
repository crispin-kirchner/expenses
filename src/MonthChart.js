import * as App from './App.js';
import * as constants from './constants.js';
import * as dates from './dates.js';
import * as positions from './positions.js';

import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    LineController,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip
} from 'chart.js';

import { baseColors } from './colors.js';
import state from './state.js';

Chart.register(
    LineElement,
    BarElement,
    PointElement,
    BarController,
    LineController,
    CategoryScale,
    LinearScale,
    Tooltip
);


function getMonthChart() {
    return document.getElementById('month-chart');
}

const isInsideGrid = function (e, chart) {
    return e.y > chart.scales.ySaved.top
        && e.y < chart.scales.ySaved.bottom
        && e.x > chart.scales.x.left
        && e.x < chart.scales.x.right;
}

function render() {
    return `
        <div class="mt-1">
            <canvas id="month-chart"></canvas>
        </div>`;
}

function onAttach() {
    positions.refreshDaysOfMonth();
    const days = state.daysOfMonth.data;

    const currentDay = dates.getFirstDayOfMonth(state.date);
    const labels = [];
    let savedCumulativeAmount = 0;
    const savedCumulativeData = [];
    const expensesData = [];
    while (currentDay.getMonth() === state.date.getMonth()) {
        const currentYmd = dates.toYmd(currentDay);
        labels.push(currentYmd);
        const expensesDay = days[currentYmd];
        if (expensesDay) {
            if (expensesDay.saved) {
                savedCumulativeAmount += expensesDay.saved;
                savedCumulativeData.push(savedCumulativeAmount);
            }
            expensesData.push(expensesDay.amount);
        }
        else {
            savedCumulativeData.push(null);
            expensesData.push(null);
        }

        currentDay.setDate(currentDay.getDate() + 1);
    }
    labels.splice(0, 0, '');
    savedCumulativeData.splice(0, 0, 0);
    expensesData.splice(0, 0, 0);

    const isValidDay = function (day) {
        return day > 0 && day <= labels.length;
    }

    const highlightDay = function (ctx, chart, day, color) {
        if (!day) {
            return;
        }

        ctx.fillStyle = color;

        const xStart = chart.scales.x.getPixelForValue(day - 0.5);
        const xEnd = chart.scales.x.getPixelForValue(day + 0.5);

        const yStart = chart.scales.ySaved.getPixelForValue(chart.scales.ySaved.min);
        const yEnd = chart.scales.ySaved.getPixelForValue(chart.scales.ySaved.max);
        ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
    }

    let hoverDay = null;
    let areaLeft = null;
    new Chart(getMonthChart(), {
        data: {
            datasets: [
                {
                    type: 'bar',
                    label: 'Ausgaben',
                    data: expensesData,
                    borderColor: `rgb(${baseColors.yellow.rgb})`,
                    backgroundColor: `rgb(${baseColors.yellow.rgb},0.2)`,
                    yAxisID: 'ySpent',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: 'Gespart kumuliert',
                    data: savedCumulativeData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'transparent',
                    yAxisID: 'ySaved',
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    pointHitRadius: 10,
                    tension: 0.25,
                    fill: true
                }
            ],
            labels: labels
        },
        options: {
            aspectRatio: 1.5,
            color: '#212529',
            layout: {
                padding: {
                    top: 7
                }
            },
            scales: {
                x: {
                    min: 0.5,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function (v) { return this.getLabelForValue(v) === '' ? '' : App.renderDay(new Date(this.getLabelForValue(v))); }
                    }
                },
                ySaved: {
                    position: 'right',
                    grid: {
                        drawTicks: false
                    },
                    ticks: {
                        mirror: true,
                        padding: -5,
                        z: 1,
                        showLabelBackdrop: true,
                        callback: x => App.renderInteger(x)
                    }
                },
                ySpent: {
                    position: 'left',
                    grid: {
                        drawTicks: false,
                        drawOnChartArea: false
                    },
                    ticks: {
                        mirror: true,
                        showLabelBackdrop: true,
                        backdropColor: `rgba(${baseColors.yellow.rgb}, 0.2)`,
                        callback: x => App.renderInteger(x)
                    }
                }
            },
            onClick(e, activeElements, chart) {
                if (activeElements.length) {
                    const ymd = labels[activeElements[0].index];
                    if (ymd.length === 10) {
                        App.setDate(new Date(ymd));
                        return;
                    }
                }
                const day = chart.scales.x.getValueForPixel(e.x);
                if (!isValidDay(day)) {
                    return;
                }
                const newDate = new Date(state.date);
                newDate.setDate(day);
                App.setDate(newDate);
            },
            onHover(e, _, chart) {
                let day = chart.scales.x.getValueForPixel(e.x);
                if (!isValidDay(day) || !isInsideGrid(e, chart)) {
                    day = null;
                }
                if (hoverDay !== day) {
                    hoverDay = day;
                    chart.render();
                }
            },
            plugins: {
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${App.renderFloat(ctx.dataset.data[ctx.dataIndex])}`,
                        title: ctx => ctx.map(c => App.renderDayHeading(new Date(c.label)))
                    }
                }
            }
        },
        plugins: [{
            id: 'custom-canvas-background',
            beforeDraw: (chart) => {
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                ctx.globalCompositeOperation = 'destination-over';

                labels
                    .forEach((ymd, i) => {
                        if (!ymd) {
                            return;
                        }
                        const dayOfWeek = new Date(ymd).getDay();
                        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                            return;
                        }
                        highlightDay(ctx, chart, i, 'rgba(25,134,84,0.1)')
                    });

                highlightDay(ctx, chart, state.date.getDate(), 'rgba(0,0,0,0.1)');
                highlightDay(ctx, chart, hoverDay, 'rgba(0,0,0,0.075)');

                ctx.restore();
            },
            beforeDatasetDraw: (chart, dataset) => {
                if (dataset.meta.type !== 'line') {
                    return;
                }
                const ctx = chart.canvas.getContext('2d');
                ctx.save();
                const offset = chart.scales.x.getPixelForValue(0.5) - chart.scales.x.getPixelForValue(0);
                areaLeft = chart.chartArea.left;
                chart.chartArea.left -= offset;
                ctx.translate(offset, 0);
            },
            afterDatasetDraw: (chart, dataset) => {
                if (dataset.meta.type !== 'line') {
                    return;
                }
                chart.chartArea.left = areaLeft;
                const ctx = chart.canvas.getContext('2d');
                ctx.restore();
            }
        }]
    });
}

export { render, onAttach };
