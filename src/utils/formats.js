import * as texts from './texts.js';

import { capitalizeFirstLetter } from './strings.js';

const dayHeadingFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'long', day: '2-digit', month: '2-digit' });
const monthFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long', year: 'numeric' });
const numberFormats = {};
numberFormats[2] = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
numberFormats[5] = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 5, maximumFractionDigits: 5 });

export function formatMonth(date) {
    return capitalizeFirstLetter(monthFormat.format(date));
}

export function formatDayHeadingDate(date) {
    return capitalizeFirstLetter(dayHeadingFormat.format(date));
}

export function formatFloat(f, numDigits) {
    numDigits = numDigits || 2;
    return numberFormats[numDigits].format(f);
}
