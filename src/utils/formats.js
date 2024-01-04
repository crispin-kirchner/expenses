import * as texts from './texts.js';

import NumberFormats from '../enums/NumberFormats.js';
import { capitalizeFirstLetter } from './strings.js';

const dayFormat = new Intl.DateTimeFormat(texts.languages, { day: 'numeric' });
const dayHeadingFormat = new Intl.DateTimeFormat(texts.languages, { weekday: 'long', day: '2-digit', month: '2-digit' });
const monthCalendarFormat = new Intl.DateTimeFormat(texts.languages, { month: 'short' });
const monthFormat = new Intl.DateTimeFormat(texts.languages, { month: 'long', year: 'numeric' });
const numberFormats = {};
numberFormats[0] = new Intl.NumberFormat(texts.languages, { useGrouping: true, maximumFractionDigits: 0 });
numberFormats[2] = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
numberFormats[5] = new Intl.NumberFormat(texts.languages, { useGrouping: true, minimumFractionDigits: 5, maximumFractionDigits: 5 });

const { localDecimalSeparator, localGroupSeparator } = (() => {
  const parts = new Intl.NumberFormat(texts.languages, { useGrouping: true }).formatToParts('12345.6');
  const localGroupSeparator = parts[1].value;
  const localDecimalSeparator = parts[3].value;
  return { localDecimalSeparator, localGroupSeparator };
})();

const numberRegex = {};
numberRegex[NumberFormats.DEFAULT] = /^[0-9\.]*$/;
numberRegex[NumberFormats.LOCAL] = new RegExp(`^[0-9${escape(localGroupSeparator)}${escape(localDecimalSeparator)}]*$`);

export { numberRegex };

const decimalSeparatorRegex = {};
decimalSeparatorRegex[NumberFormats.DEFAULT] = /\./;
decimalSeparatorRegex[NumberFormats.LOCAL] = new RegExp(`\\${localDecimalSeparator}`);

const localGroupSeparatorRegex = new RegExp(`\\${localGroupSeparator}`, 'g');

function escape(character) {
  if (character === '.') {
    return `\\${character}`;
  }
  return character;
}

export function formatDay(date) {
  return dayFormat.format(date);
}

export function formatCalendarMonth(date) {
  return monthCalendarFormat.format(date);
}

export function formatMonth(date) {
  return capitalizeFirstLetter(monthFormat.format(date));
}

export function formatDayHeadingDate(date) {
  return capitalizeFirstLetter(dayHeadingFormat.format(date));
}

export function formatInteger(i) {
  return numberFormats[0].format(i);
}

export function formatFloat(f) {
  return numberFormats[2].format(f);
}

export function parseIntlFloat(number) {
  if (!numberRegex[NumberFormats.LOCAL].test(number)) {
    return NaN;
  }
  return parseFloat(localToFloatString(number));
}

export function localToFloatString(number) {
  return number
    .replaceAll(localGroupSeparatorRegex, '')
    .replace(decimalSeparatorRegex[NumberFormats.LOCAL], '.');
}

export function prettyPrintFloatString(number, numFractionDigits, inputFormat) {
  if (!number) {
    return '';
  }

  inputFormat = inputFormat || NumberFormats.LOCAL;

  if (!numberRegex[inputFormat].test(number)) {
    return number;
  }

  if (inputFormat === NumberFormats.LOCAL) {
    number = localToFloatString(number);
  }

  let [integerPart, fractionalPart] = number.split(decimalSeparatorRegex[NumberFormats.DEFAULT]);

  integerPart = integerPart
    ? formatInteger(integerPart)
    : '0';

  fractionalPart = fractionalPart
    ? fractionalPart.substring(0, numFractionDigits).padEnd(numFractionDigits, '0')
    : '0'.repeat(numFractionDigits);

  return `${integerPart}${localDecimalSeparator}${fractionalPart}`;
}
