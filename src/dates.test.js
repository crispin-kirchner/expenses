import * as dates from './dates.js';

it('converts a date to a ymd', () => {
    expect(dates.toYmd(new Date('2022-04-01'))).toBe('2022-04-01');
});

it('increments the month', () => {
    expect(dates.toYmd(dates.incrementMonth(new Date('2022-03-15')))).toBe('2022-04-15');
    expect(dates.toYmd(dates.incrementMonth(new Date('2021-12-01')))).toBe('2022-01-01');
    expect(dates.toYmd(dates.incrementMonth(new Date('2022-03-31')))).toBe('2022-04-30');
});

it('computes first day of next month', () => {
    expect(dates.toYmd(dates.getFirstDayOfNextMonth(new Date('2022-03-31')))).toBe('2022-04-01');
});

it('checks if date is in month', () => {
    expect(dates.isInMonth(new Date('2022-04-01'), new Date('2022-03-31'))).toBe(false);
});
