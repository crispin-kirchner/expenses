function getDayMondayBased(date) {
    return (((date.getDay() - 1) % 7) + 7) % 7;
}

function getFirstDayOfWeek(date) {
    const result = new Date(date);
    result.setDate(result.getDate() - getDayMondayBased(date));
    return result;
}

function getLastDayOfWeek(date) {
    const result = new Date(date);
    result.setDate(result.getDate() + (6 - getDayMondayBased(date)));
    return result;
}

function getFirstDayOfNextMonth(date) {
    const result = incrementMonth(date);
    result.setDate(1);
    return result;
}

function isInMonth(date, month) {
    const firstDayOfNextMonth = getFirstDayOfNextMonth(month);
    const firstDayOfCurrentMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    return date < firstDayOfNextMonth && date >= firstDayOfCurrentMonth;
}

function getLastRecurrence(validFrom, validTo) {
    let month = validTo.getMonth();
    if (validFrom.getDate() > validTo.getDate() && !isSameDay(validTo, getLastDayOfMonth(validTo))) {
        --month;
    }
    return new Date(validTo.getFullYear(), month, validFrom.getDate());
}

function isValidInMonth(validFrom, validTo, month) {
    const thisRecurrence = projectToMonth(validFrom, month);
    let lastRecurrence;
    if (validTo) {
        lastRecurrence = getLastRecurrence(validFrom, validTo);
    }
    return validFrom < getFirstDayOfNextMonth(month) && (!validTo || thisRecurrence <= lastRecurrence);
}

function isSameDay(d1, d2) {
    return isSameMonth(d1, d2)
        && d1.getDate() === d2.getDate();
}

function isSameMonth(d1, d2) {
    return d1.getMonth() === d2.getMonth()
        && d1.getFullYear() === d2.getFullYear();
}

function toYmd(date) {
    if (!date) {
        return '';
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, 0)}`;
}

function incrementMonth(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (date.getMonth() === 11) {
        ++year;
        month = 0;
    }
    return projectToMonth(date, new Date(year, month));
}

function projectToMonth(date, month) {
    let result = new Date(month.getFullYear(), month.getMonth(), date.getDate());
    if (result.getMonth() > month.getMonth()) {
        return getLastDayOfMonth(month);
    }
    return result;
}

function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function decrementMonth(date) {
    let year = date.getFullYear();
    let month = date.getMonth() - 1;
    if (date.getMonth() === 0) {
        --year;
        month = 11;
    }
    return projectToMonth(date, new Date(year, month));
}

export {
    decrementMonth,
    getFirstDayOfWeek,
    getLastDayOfWeek,
    getFirstDayOfMonth,
    getFirstDayOfNextMonth,
    getLastDayOfMonth,
    getLastRecurrence,
    incrementMonth,
    isInMonth,
    isSameDay,
    isSameMonth,
    isValidInMonth,
    projectToMonth,
    toYmd
}
