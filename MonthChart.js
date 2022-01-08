import * as constants from './constants.js';
import * as expenses from './expenses.js';
import * as expensesApp from './expensesApp.js';

function getMonthChart() {
    return document.getElementById('month-chart');
}

const isInsideGrid = function (e, chart) {
    return e.y > chart.scales.y.top
        && e.y < chart.scales.y.bottom
        && e.x > chart.scales.x.left
        && e.x < chart.scales.x.right;
}

function render() {
    return `
        <div>
            <canvas id="month-chart"></canvas>
        </div>`;
}

function onAttach() {
    const days = expenses.getDaysOfMonth(state.date);

    let savedCumulativeAmount = 0;
    const savedCumulativeData = days
        .map(day => (savedCumulativeAmount += day.saved));
    savedCumulativeData.splice(0, 0, 0);

    const labels = days
        .map(day => day.date);
    labels.splice(0, 0, '');

    const expensesData = days
        .map(day => day.amount);
    expensesData.splice(0, 0, 0);

    const isValidDay = function (day) {
        return day > 0 && day <= days.length;
    }

    const highlightDay = function (ctx, chart, day, color) {
        if (!day) {
            return;
        }

        ctx.fillStyle = color;

        const xStart = chart.scales.x.getPixelForValue(day - 0.5);
        const xEnd = chart.scales.x.getPixelForValue(day + 0.5);

        const yStart = chart.scales.y.getPixelForValue(chart.scales.y.min);
        const yEnd = chart.scales.y.getPixelForValue(chart.scales.y.max);
        ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
    }

    let hoverDay = null;
    let areaLeft = null;
    // bootstrap default fonts
    Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
    new Chart(getMonthChart(), {
        data: {
            datasets: [
                {
                    type: 'bar',
                    label: 'Ausgaben',
                    data: expensesData,
                    borderColor: 'rgb(255,193,7)',
                    backgroundColor: 'rgb(255,193,7,0.2)',
                    borderWidth: 1
                },
                {
                    type: 'line',
                    label: 'Gespart kumuliert',
                    data: savedCumulativeData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'transparent',
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
            animation: false,
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
                        callback: function (v) { return this.getLabelForValue(v) === '' ? '' : expensesApp.renderDay(this.getLabelForValue(v)); }
                    }
                },
                y: {
                    max: 1200,
                    position: 'right',
                    afterBuildTicks: scale => { scale.ticks = scale.ticks.filter(t => t.value !== 0); },
                    grid: {
                        drawTicks: false
                    },
                    ticks: {
                        mirror: true,
                        padding: -5,
                        z: 1,
                        showLabelBackdrop: true,
                        callback: x => constants.bigNumberFormat.format(x)
                    }
                }
            },
            onClick(e, activeElements, chart) {
                if (activeElements.length) {
                    const ymd = labels[activeElements[0].index];
                    if (ymd.length === 10) {
                        setDate(new Date(ymd));
                        return;
                    }
                }
                const day = chart.scales.x.getValueForPixel(e.x);
                if (!isValidDay(day)) {
                    return;
                }
                const newDate = new Date(state.date);
                newDate.setDate(day);
                setDate(newDate);
            },
            onHover(e, activeElements, chart) {
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
                legend: {
                    display: false
                },
                tooltip: {
                    displayColors: false,
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${constants.DEFAULT_CURRENCY} ${expensesApp.renderFloat(ctx.dataset.data[ctx.dataIndex])}`,
                        title: ctx => ctx.map(c => expensesApp.renderDayHeading(c.label))
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

                Object.values(days)
                    .filter(d => d.weekend)
                    .forEach(d => highlightDay(ctx, chart, d.index, 'rgba(25,134,84,0.1)'));

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
