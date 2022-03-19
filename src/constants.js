import { Chart } from 'chart.js';

const preferredLocale = 'de-CH';
const dayHeadingFormat = new Intl.DateTimeFormat([preferredLocale], { weekday: 'long', day: '2-digit', month: '2-digit' });
const dayFormat = new Intl.DateTimeFormat([preferredLocale], { day: 'numeric' });
const dayCalendarFormat = new Intl.DateTimeFormat([preferredLocale], { weekday: 'short' });
const monthFormat = new Intl.DateTimeFormat([preferredLocale], { month: 'long', year: 'numeric' });
const numberFormat = new Intl.NumberFormat([preferredLocale], { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bigNumberFormat = new Intl.NumberFormat([preferredLocale], { useGrouping: true, maximumFractionDigits: 0 });
const decimalRegex = /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
const integerRegex = /^([0-9]+)$/;
const labelRegex = /#(\p{Letter}+)\b/ug;
const DEFAULT_CURRENCY = 'CHF';
const defaultExchangeRate = '1.00000';
const defaultLabelColor = 'grayWhite';
const unspecificDimension = 'Andere';
const standardDimension = 'Standard';
const today = new Date(Date.now());

// bootstrap default fonts
Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
Chart.defaults.animation = false;

export {
    preferredLocale,
    dayHeadingFormat,
    dayFormat,
    monthFormat,
    numberFormat,
    bigNumberFormat,
    decimalRegex,
    integerRegex,
    labelRegex,
    DEFAULT_CURRENCY,
    defaultExchangeRate,
    defaultLabelColor,
    unspecificDimension,
    standardDimension,
    today,
    dayCalendarFormat
};
