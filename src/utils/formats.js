import * as texts from './texts.js';

import { capitalizeFirstLetter } from './strings.js';

const dayHeadingFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'long', day: '2-digit', month: '2-digit' });
const monthFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long', year: 'numeric' });
const numberFormats = {};
numberFormats[0] = new Intl.NumberFormat(texts.languages, { useGrouping: true, maximumFractionDigits: 0 });
numberFormats[2] = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
numberFormats[5] = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 5, maximumFractionDigits: 5 });

const defaultDecimalSeparatorRegex = /\./;
export { defaultDecimalSeparatorRegex };

const { decimalSeparator, groupSeparatorRegex, intlDecimalSeparatorRegex, numberRegex } = (() => {
    const parts = new Intl.NumberFormat(texts.languages, { useGrouping: true }).formatToParts('12345.6');
    const groupSeparator = parts[1].value;
    const decimalSeparator = parts[3].value;
    return {
        decimalSeparator,
        groupSeparatorRegex: new RegExp(`\\${groupSeparator}`, 'g'),
        intlDecimalSeparatorRegex: new RegExp(`\\${decimalSeparator}`),
        numberRegex: new RegExp(`^[0-9\\${groupSeparator}\\${decimalSeparator}]*$`)
    };
})();

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

export function parseIntlFloat(number) {
    if (!isIntlFloat(number)) {
        return NaN;
    }
    return parseFloat(number
        .replaceAll(groupSeparatorRegex, '')
        .replace(intlDecimalSeparatorRegex, '.'));
}

function isIntlFloat(number) {
    return numberRegex.test(number);
}

export function prettyPrintIntlFloatString(number, numFractionDigits, decimalSeparatorRegex) {
    if (!number) {
        return '';
    }
    if (!isIntlFloat(number)) {
        throw 'number contains illegal characters';
    }

    decimalSeparatorRegex = decimalSeparatorRegex || intlDecimalSeparatorRegex;

    let [integerPart, fractionalPart] = number.split(decimalSeparatorRegex);

    integerPart = integerPart
        ? numberFormats[0].format(integerPart)
        : '0';

    fractionalPart = fractionalPart
        ? fractionalPart.substring(0, numFractionDigits).padEnd(numFractionDigits, '0')
        : '0'.repeat(numFractionDigits);

    return `${integerPart}${decimalSeparator}${fractionalPart}`;
}
