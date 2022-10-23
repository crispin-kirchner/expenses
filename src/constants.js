import * as texts from './utils/texts.js';

// TODO wieder rein holen oder ganz rauswerfen
// import { Chart } from 'chart.js';


const dayCalendarFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'short' });
const dayFormat = new Intl.DateTimeFormat(texts.languages, { day: 'numeric' });
const daySearchResultFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'short', day: 'numeric' })

const monthOnlyFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long' });
const bigNumberFormat = new Intl.NumberFormat(texts.languages, { useGrouping: true, maximumFractionDigits: 0 });
const decimalRegex = /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
const integerRegex = /^([0-9]+)$/;
const labelRegex = /#(\p{Letter}*)\b/ug;
const defaultExchangeRate = '1.00000';
const defaultLabelColor = 'grayWhite';
const unspecificDimension = 'Andere';
const standardDimension = 'Standard';
const today = new Date(Date.now());

/*
// bootstrap default fonts
Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
Chart.defaults.animation = false;
*/

export {
    dayCalendarFormat,
    dayFormat,
    daySearchResultFormat,
    monthOnlyFormat,
    bigNumberFormat,
    decimalRegex,
    integerRegex,
    labelRegex,
    defaultExchangeRate,
    defaultLabelColor,
    unspecificDimension,
    standardDimension,
    today
};
