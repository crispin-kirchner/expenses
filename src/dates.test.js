import * as dates from './dates.js';

it('converts a date to a ymd', () => {
    expect(dates.toYmd(new Date('2022-04-01'))).toBe('2022-04-01');
    expect(dates.toYmd(new Date('2022-04-30'))).toBe('2022-04-30');
    expect(dates.toYmd(new Date('2022-04-15'))).toBe('2022-04-15');
    expect(dates.toYmd(new Date('2023-01-01'))).toBe('2023-01-01');
    expect(dates.toYmd(new Date('2021-09-30'))).toBe('2021-09-30');
});

it('increments the month', () => {
    expect(dates.toYmd(dates.incrementMonth(new Date('2022-03-15')))).toBe('2022-04-15');
    expect(dates.toYmd(dates.incrementMonth(new Date('2021-12-01')))).toBe('2022-01-01');
    expect(dates.toYmd(dates.incrementMonth(new Date('2022-03-31')))).toBe('2022-04-30');
});

it('decrements the month', () => {
    expect(dates.toYmd(dates.decrementMonth(new Date('2022-01-14')))).toBe('2021-12-14');
    expect(dates.toYmd(dates.decrementMonth(new Date('2022-05-31')))).toBe('2022-04-30');
    expect(dates.toYmd(dates.decrementMonth(new Date('2022-06-30')))).toBe('2022-05-30');
});

it('computes first day of next month', () => {
    expect(dates.toYmd(dates.getFirstDayOfNextMonth(new Date('2022-03-31')))).toBe('2022-04-01');
    expect(dates.toYmd(dates.getFirstDayOfNextMonth(new Date('2022-12-15')))).toBe('2023-01-01');
});

it('checks if date is in month', () => {
    expect(dates.isInMonth(new Date('2022-04-01'), new Date('2022-03-31'))).toBe(false);
    expect(dates.isInMonth(new Date('2022-04-15'), new Date('2022-04-01'))).toBe(true);
});

it('computes the last recurrence', () => {
    expect(dates.toYmd(dates.getLastRecurrence(new Date('2022-09-30'), new Date('2022-09-29')))).toBe('2022-08-30');
    expect(dates.toYmd(dates.getLastRecurrence(new Date('2021-10-23'), new Date('2022-04-28')))).toBe('2022-04-23');
});

it('projects a date into another month', () => {
    expect(dates.toYmd(dates.projectToMonth(new Date('2022-03-31'), new Date('2022-04-01')))).toBe('2022-04-30');
    expect(dates.toYmd(dates.projectToMonth(new Date('2022-12-31'), new Date('2020-02-01')))).toBe('2020-02-29');
});

it('checks if recurring date is in month', () => {
    expect(dates.isValidInMonth(
        new Date('2021-09-30'), // validFrom
        new Date('2022-09-29'), // validTo
        new Date('2022-09-01'))) // month
        .toBe(false);

    expect(dates.isValidInMonth(
        new Date('2022-03-31'),
        new Date('2022-04-30'),
        new Date('2022-04-30')))
        .toBe(true);
});
