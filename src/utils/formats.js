import * as texts from './texts.js';

const dayHeadingFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'long', day: '2-digit', month: '2-digit' });
const monthFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long', year: 'numeric' });
const numberFormat = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formats = {
    capitalizeFirstLetter: str => str.charAt(0).toUpperCase() + str.slice(1),
    dayHeadingDate: date => formats.capitalizeFirstLetter(dayHeadingFormat.format(date)),
    month: date => monthFormat.format(date),
    float: f => numberFormat.format(f)
};

export default formats;
