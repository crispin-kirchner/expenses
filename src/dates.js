function getFirstDayOfNextMonth(date) {
    return incrementMonth(date).setDate(1);
}

function isInMonth(date, month) {
    const firstDayOfNextMonth = getFirstDayOfNextMonth(month);
    const firstDayOfCurrentMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    return date < firstDayOfNextMonth && date >= firstDayOfCurrentMonth;
}

function isValidInMonth(validFrom, validTo, month) {
    const thisRecurrence = new Date(month.getFullYear(), month.getMonth(), validFrom.getDate());
    let lastRecurrence;
    if (validTo) {
        lastRecurrence = new Date(validTo.getFullYear(), validTo.getMonth(), validFrom.getDate());
    }
    return validFrom < getFirstDayOfNextMonth(month) && (!validTo || thisRecurrence <= lastRecurrence);
}

function isSameDay(d1, d2) {
    return isSameMonth(d1, d2)
        && d1.getFullYear() === d2.getFullYear();
}

function isSameMonth(d1, d2) {
    return d1.getDate() === d2.getDate()
        && d1.getMonth() === d2.getMonth();
}

function toYmd(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, 0)}`;
}

function incrementMonth(date) {
    if (date.getMonth() === 11) {
        return new Date(date.getFullYear() + 1, 0, date.getDate());
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function decrementMonth(date) {
    if (date.getMonth() === 0) {
        return new Date(date.getFullYear() - 1, 11, date.getDate());
    }
    const lastDayOfMonth = getLastDayOfMonth(date);
    if (isSameDay(lastDayOfMonth, date)) {
        return new Date(date.getFullYear(), date.getMonth(), 0);
    }
    return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
}

export { isInMonth, isValidInMonth, toYmd, incrementMonth, decrementMonth, isSameMonth, isSameDay, getLastDayOfMonth, getFirstDayOfMonth };
