import * as expenses from './expenses.js';
import * as constants from './constants.js';
import * as expensesApp from './expensesApp.js';
import state from './state.js';

function renderDayContent(day) {
    let amounts = '';
    if (day.date <= constants.today) {
        let savedClasses = '';
        if (day.saved < 0) {
            savedClasses = 'text-danger';
        }
        else if (day.saved > 0) {
            savedClasses = 'text-success';
        }
        amounts = `
            <div class="position-absolute bottom-0 end-0 text-end p-sm-1 p-lg-2 sm-small lh-1 lh-md-base w-100">
            <span class="w-100 d-inline-flex justify-content-between">
                <i class="bi-box-arrow-right"></i> ${expensesApp.renderFloat(day.amount)}
            </span><br />
            <span class="${savedClasses} w-100 d-inline-flex justify-content-between">
                <i class="bi-piggy-bank"></i> ${expensesApp.renderFloat(day.saved)}</span>
            </div>`;
    }
    return `
        <div>
            <div class="position-absolute top-0 start-0 small lh-small">
                <span class="bg-dark text-light rounded px-05">
                    ${day.date.getDate()}
                </span>
                &nbsp;${constants.dayCalendarFormat.format(day.date)}
            </div>
            ${amounts}
        </div>`;
}

function renderDay(day, i, length) {
    let marginClasses = '';
    if (i === 0) {
        marginClasses = 'ms-auto';
    }
    else if (i === length - 1) {
        marginClasses = 'me-auto';
    }

    let dayClasses = '';
    if (day) {
        dayClasses += 'border rounded xpns-day cursor-pointer';
        if (expensesApp.isSameDay(day.date, state.date)) {
            dayClasses += ' active';
        }
        const weekday = day.date.getDay();
        if (expensesApp.isSameDay(day.date, constants.today)) {
            dayClasses += ' bg-warning bg-opacity-10 border-warning';
        }
        else if (weekday === 0 || weekday === 6) {
            dayClasses += ' bg-success bg-opacity-25 border-success-opacity-25';
        }
    }

    const dataTag = day ? `data-xpns-ymd="${expensesApp.dateToYmd(day.date)}"` : '';
    return `
        <div class="col gx-1 gy-1">
            <div class="${dayClasses} ratio ratio-1x1 position-relative" ${dataTag}>
                ${day ? renderDayContent(day) : ''}
            </div>
        </div>`;
}

function shiftMondayStartOfWeek(day) {
    return (day - 1) % 7
}

function render() {
    const days = expenses.getDaysOfMonth(state.date);

    const rowPattern = '<div class="row">';
    let result = '<div class="container px-2">' + rowPattern;
    const firstDayIndex = shiftMondayStartOfWeek(days[0].date.getDay());
    for (let i = 0; i < firstDayIndex; ++i) {
        result += renderDay();
    }
    for (let i = 0; i < days.length; ++i) {
        result += renderDay(days[i], i, days.length);
        const day = days[i].date.getDay();
        if (day === 0 && i !== days.length - 1) {
            result += `</div>${rowPattern}`;
        }
    }
    const lastDayIndex = shiftMondayStartOfWeek(days[days.length - 1].date.getDay());
    for (let i = lastDayIndex + 1; i < 7; ++i) {
        result += renderDay();
    }
    result += '</div></div>';

    return result;
}

function handleDayClick(evt) {
    expensesApp.setDate(new Date(evt.currentTarget.dataset.xpnsYmd));
}

function onAttach() {
    document.querySelectorAll('.xpns-day[data-xpns-ymd]')
        .forEach(e => e.addEventListener('click', handleDayClick));
}

export { render, onAttach }
