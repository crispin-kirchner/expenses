import * as currencies from './currencies.js';
import * as texts from './texts.js';

// TODO wieder rein holen oder ganz rauswerfen
// import { Chart } from 'chart.js';

const dayHeadingFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'long', day: '2-digit', month: '2-digit' });
const dayCalendarFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'short' });
const dayFormat = new Intl.DateTimeFormat(texts.languages, { day: 'numeric' });
const daySearchResultFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'short', day: 'numeric' })
const monthFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long', year: 'numeric' });
const monthOnlyFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long' });
const numberFormat = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bigNumberFormat = new Intl.NumberFormat(texts.languages, { useGrouping: true, maximumFractionDigits: 0 });
const decimalRegex = /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
const integerRegex = /^([0-9]+)$/;
const labelRegex = /#(\p{Letter}*)\b/ug;
const DEFAULT_CURRENCY = currencies.CHF;
const defaultExchangeRate = '1.00000';
const defaultLabelColor = 'grayWhite';
const unspecificDimension = 'Andere';
const standardDimension = 'Standard';
const SUB_CENT = 0.005;
const today = new Date(Date.now());

/*
// bootstrap default fonts
Chart.defaults.font.family = 'system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
Chart.defaults.animation = false;
*/

export {
    dayHeadingFormat,
    dayCalendarFormat,
    dayFormat,
    daySearchResultFormat,
    monthFormat,
    monthOnlyFormat,
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
    SUB_CENT,
    today
};
