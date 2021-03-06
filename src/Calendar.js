import * as App from './App.js';
import * as constants from './constants.js';
import * as dates from './dates.js';
import * as positions from './positions.js';

import state from './state.js';

function renderCalendarAmount(amount) {
    return `
        <span class="d-md-none">${App.renderInteger(amount)}</span>
        <span class="d-none d-md-inline">${App.renderFloat(amount)}</span>`;
}

function renderDayContent(date, dayExpenses) {
    let amounts = '';
    if (dayExpenses && date <= constants.today) {
        let savedClasses = '';
        if (dayExpenses.saved < 0) {
            savedClasses = 'text-danger';
        }
        else if (dayExpenses.saved > 0) {
            savedClasses = 'text-success';
        }
        let noExpenses = App.isSubCent(dayExpenses.amount);
        let savedIcon = noExpenses ? 'bi-piggy-bank-fill' : 'bi-piggy-bank';
        amounts = `
            <div class="position-absolute bottom-0 end-0 text-end p-05 sm-small lh-1 lh-md-base w-100">
            <span class="w-100 d-inline-flex justify-content-between">
                <i class="bi-box-arrow-right"></i> ${noExpenses ? '&ndash;&ndash;' : renderCalendarAmount(dayExpenses.amount)}
            </span><br />
            <span class="${savedClasses} w-100 d-inline-flex justify-content-between">
                <i class="${savedIcon}"></i> ${renderCalendarAmount(dayExpenses.saved)}</span>
            </div>`;
    }
    return `
        <div>
            <div class="position-absolute d-flex top-0 start-0 small lh-small">
                <div class="bg-dark text-light rounded-tlbr-1 me-1 text-center" style="width: 1.4rem">
                    ${App.renderDay(date)}
                </div>
                <div>${constants.dayCalendarFormat.format(date)}</div>
            </div>
            ${amounts}
        </div>`;
}

function renderDay(date, dayExpenses) {
    let dayClasses = '';
    if (date) {
        dayClasses += 'border rounded xpns-hover cursor-pointer';
        if (dates.isSameDay(date, state.date)) {
            dayClasses += ' active';
        }
        const weekday = date.getDay();
        if (dates.isSameDay(date, constants.today)) {
            dayClasses += ' bg-warning bg-opacity-10 border-warning';
        }
        else if (weekday === 0 || weekday === 6) {
            dayClasses += ' bg-success bg-opacity-25 border-success-opacity-25';
        }
    }

    const dataTag = date ? `data-xpns-ymd="${dates.toYmd(date)}"` : '';
    return `
        <div class="col gx-1 gy-1">
            <div class="${dayClasses} ratio ratio-1x1 position-relative" ${dataTag}>
                ${date ? renderDayContent(date, dayExpenses) : ''}
            </div>
        </div>`;
}

function shiftMondayStartOfWeek(day) {
    return (((day - 1) % 7) + 7) % 7;
}

function render() {
    positions.refreshDaysOfMonth();
    const days = state.daysOfMonth.data;

    const rowPattern = '<div class="row">';
    let result = '<div class="container px-2">' + rowPattern;
    const currentDay = dates.getFirstDayOfMonth(state.date)
    const firstDayIndex = shiftMondayStartOfWeek(currentDay.getDay());
    for (let i = 0; i < firstDayIndex; ++i) {
        result += renderDay();
    }
    const lastDayOfMonth = dates.getLastDayOfMonth(state.date);
    while (currentDay.getMonth() === state.date.getMonth()) {
        result += renderDay(currentDay, days[dates.toYmd(currentDay)]);
        if (currentDay.getDay() === 0 && !dates.isSameDay(lastDayOfMonth, currentDay)) {
            result += `</div>${rowPattern}`;
        }
        currentDay.setDate(currentDay.getDate() + 1);
    }
    const lastDayIndex = shiftMondayStartOfWeek(lastDayOfMonth.getDay());
    for (let i = lastDayIndex + 1; i < 7; ++i) {
        result += renderDay();
    }
    result += '</div></div>';

    return result;
}

function handleDayClick(evt) {
    App.setDate(new Date(evt.currentTarget.dataset.xpnsYmd));
}

function onAttach() {
    document.querySelectorAll('.xpns-hover[data-xpns-ymd]')
        .forEach(e => e.addEventListener('click', handleDayClick));
}

export { render, onAttach }
