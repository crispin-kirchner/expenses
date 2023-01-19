import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { formatDay, formatDayHeadingDate, formatFloat } from '../utils/formats';
import { useCallback, useMemo } from 'react';

import { Bar } from 'react-chartjs-2';
import _ from 'lodash';
import { baseColors } from '../enums/colors';
import t from '../utils/texts';
import { toYmd } from '../utils/dates';

ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip
);

ChartJS.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

function computeData(daysOfMonth, dailyBudget, positionsByDay) {
  const labels = _.clone(daysOfMonth);
  const expensesData = [];
  const savedCumulativeData = [0];

  const today = toYmd(new Date());

  if (!positionsByDay) {
    labels.splice(0, 0, '');
    return {
      labels,
      datasets: []
    };
  }

  for (let i = 0; i < labels.length; ++i) {
    const ymd = labels[i];

    const dayAmount = positionsByDay[ymd]?.expensesSum || 0;
    expensesData.push(dayAmount);

    if (ymd <= today) {
      savedCumulativeData[i + 1] = positionsByDay[ymd].savedCumulative;
    }
  }

  labels.splice(0, 0, '');
  expensesData.splice(0, 0, 0);

  return {
    labels,
    datasets: [
      {
        type: 'bar',
        label: t('Expenses'),
        yAxisID: 'ySpent',
        data: expensesData,
        borderColor: `rgb(${baseColors.yellow.rgb})`,
        backgroundColor: `rgb(${baseColors.yellow.rgb},0.2)`,
        borderWidth: 1
      },
      {
        type: 'line',
        label: 'Gespart kumuliert',
        borderColor: `rgb(${baseColors.blue.rgb})`,
        backgroundColor: 'transparent',
        yAxisID: 'ySaved',
        data: savedCumulativeData,
        tension: 0.25,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 10,
        clip: false
      }
    ]
  };
}

function highlightXIndex(ctx, chart, index, color) {
  if (!index) {
    return;
  }

  ctx.fillStyle = color;

  const xStart = chart.scales.x.getPixelForValue(index - 0.5);
  const xEnd = chart.scales.x.getPixelForValue(index + 0.5);

  const yStart = chart.scales.ySaved.getPixelForValue(chart.scales.ySaved.min);
  const yEnd = chart.scales.ySaved.getPixelForValue(chart.scales.ySaved.max);
  ctx.fillRect(xStart, yStart, xEnd - xStart, yEnd - yStart);
}

function isInsideGrid(e, chart) {
  return e.y > chart.scales.ySaved.top
    && e.y < chart.scales.ySaved.bottom
    && e.x > chart.scales.x.left
    && e.x < chart.scales.x.right;
}

class MonthChartPlugin {
  constructor() {
    this.id = 'month-chart-plugin';

    this.areaLeft = null;
    this.hoverDay = null;
    this.date = null;
  }

  beforeDraw(chart) {
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';

    chart.config.data.labels
      .forEach((ymd, i) => {
        if (!ymd) {
          return;
        }
        const dayOfWeek = new Date(ymd).getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          return;
        }
        highlightXIndex(ctx, chart, i, 'rgba(25,134,84,0.1)');
      });

    highlightXIndex(ctx, chart, this.date?.getDate(), 'rgba(0,0,0,0.1)');
    highlightXIndex(ctx, chart, this.hoverDay, 'rgba(0,0,0,0.075)');

    ctx.restore();
  }

  beforeDatasetDraw(chart, dataset) {
    if (dataset.meta.type !== 'line') {
      return;
    }
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    const offset = chart.scales.x.getPixelForValue(0.5) - chart.scales.x.getPixelForValue(0);
    this.areaLeft = chart.chartArea.left;
    chart.chartArea.left -= offset;
    ctx.translate(offset, 0);
  }

  afterDatasetDraw(chart, dataset) {
    if (dataset.meta.type !== 'line') {
      return;
    }
    chart.chartArea.left = this.areaLeft;
    const ctx = chart.canvas.getContext('2d');
    ctx.restore();
  }
}

const plugin = new MonthChartPlugin();

// TODO Tooltips
export default function MonthChart({ date, dailyBudget, daysOfMonth, positionsByDay, setDate }) {
  plugin.date = date;
  const data = useMemo(() => computeData(daysOfMonth, dailyBudget, positionsByDay), [daysOfMonth, dailyBudget, positionsByDay]);

  const isValidDay = useCallback(day => day > 0 && day <= data.labels.length, [data]);

  const options = useMemo(() => ({
    aspectRatio: 1.25,
    scales: {
      x: {
        min: 1,
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          callback: function (v) { return this.getLabelForValue(v) === '' ? '' : formatDay(new Date(this.getLabelForValue(v))); }
        }
      },
      ySaved: {
        position: 'right',
        beginAtZero: true,
        grid: {
          drawTicks: false
        },
        ticks: {
          mirror: true,
          padding: -5,
          z: 1,
          showLabelBackdrop: true,
          backdropColor: `rgba(${baseColors.blue.rgb}, 0.1)`,
        }
      },
      ySpent: {
        position: 'left',
        beginAtZero: true,
        grid: {
          drawTicks: false,
          drawOnChartArea: false
        },
        ticks: {
          mirror: true,
          showLabelBackdrop: true,
          backdropColor: `rgba(${baseColors.yellow.rgb}, 0.2)`,
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${formatFloat(ctx.dataset.data[ctx.dataIndex])}`,
          title: ctx => ctx.map(c => formatDayHeadingDate(new Date(c.label)))
        }
      }
    },
    onHover(e, _, chart) {
      let day = chart.scales.x.getValueForPixel(e.x);
      if (!isValidDay(day) || !isInsideGrid(e, chart)) {
        day = null;
      }
      if (plugin.hoverDay !== day) {
        plugin.hoverDay = day;
        chart.render();
      }
    },
    onClick(e, activeElements, chart) {
      if (activeElements.length) {
        const ymd = data.labels[activeElements[0].index];
        if (ymd.length === 10) {
          setDate(new Date(ymd));
          return;
        }
      }
      const day = chart.scales.x.getValueForPixel(e.x);
      if (!isValidDay(day)) {
        return;
      }
      const newDate = new Date(date);
      newDate.setDate(day);
      setDate(newDate);
    }
  }), [data, date, setDate, isValidDay]);

  return (
    <Bar data={data} options={options} plugins={[plugin]} />
  );
}
