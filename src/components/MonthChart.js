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
import { getFirstDayOfMonth, toYmd } from '../utils/dates';

import { Bar } from 'react-chartjs-2';
import { baseColors } from '../enums/colors';
import { formatDay } from '../utils/formats';
import t from '../utils/texts';
import { useMemo } from 'react';

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

// TODO irgendwie global machen auch für Treemap
ChartJS.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

// TODO gespartes-Berechnung/Daily-Budget-Berechnung mit dem Kalender/der Outline teilen
function computeData(date, incomeAmount, recurringAmount, positionsByDay) {
  const month = date.getMonth();
  const labels = [];
  const expensesData = [];
  const savedCumulativeData = [0];

  for (const currentDay = getFirstDayOfMonth(date)
    ; currentDay.getMonth() === month
    ; currentDay.setDate(currentDay.getDate() + 1)) {

    labels.push(toYmd(currentDay));
  }

  const dailyBudget = (incomeAmount - recurringAmount) / labels.length;

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

    if (ymd < today) {
      const savedToday = dailyBudget - dayAmount;
      savedCumulativeData[i + 1] = savedCumulativeData[i] + savedToday;
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
        // pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 10,
        clip: false
      }
    ]
  };
}

const options = {
  aspectRatio: 1.25,
  scales: {
    x: {
      min: 1,
      ticks: {
        callback: function (v) { return this.getLabelForValue(v) === '' ? '' : formatDay(new Date(this.getLabelForValue(v))); }
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
        backdropColor: `rgba(${baseColors.blue.rgb}, 0.1)`,
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
      }
    }
  }
}

class MonthChartPlugin {
  constructor() {
    this.id = 'month-chart-plugin';

    this.areaLeft = null;
  }

  beforeDraw(chart) {
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

// TODO Background/onclick
export default function MonthChart({ date, incomeAmount, recurringAmount, positionsByDay }) {
  const data = useMemo(() => computeData(date, incomeAmount, recurringAmount, positionsByDay), [date, incomeAmount, recurringAmount, positionsByDay]);

  return (
    <Bar data={data} options={options} plugins={[plugin]} />
  );
}