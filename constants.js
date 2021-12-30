const preferredLocale = 'de-CH';
const dayHeadingFormat = new Intl.DateTimeFormat([preferredLocale], { weekday: 'long', day: '2-digit', month: '2-digit' });
const dayFormat = new Intl.DateTimeFormat([preferredLocale], { day: 'numeric' });
const monthFormat = new Intl.DateTimeFormat([preferredLocale], { month: 'long', year: 'numeric' });
const numberFormat = new Intl.NumberFormat([preferredLocale], { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const bigNumberFormat = new Intl.NumberFormat([preferredLocale], { useGrouping: true, maximumFractionDigits: 0 });
const decimalRegex = /^([0-9]+\.?[0-9]*|\.[0-9]+)$/;
const integerRegex = /^([0-9]+)$/;
const tagRegex = /#(\p{Letter}+)\b/ug;
const DEFAULT_CURRENCY = 'CHF';
const defaultExchangeRate = '1.00000';
const defaultTagColor = 'grayWhite';

export {
    preferredLocale,
    dayHeadingFormat,
    dayFormat,
    monthFormat,
    numberFormat,
    bigNumberFormat,
    decimalRegex,
    integerRegex,
    tagRegex,
    DEFAULT_CURRENCY,
    defaultExchangeRate,
    defaultTagColor
};
