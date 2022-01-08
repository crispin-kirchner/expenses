import state from './state.js';
import * as constants from './constants.js';

function getOnetimeExpenses() {
    return state.data.expenses
        .filter(e => !e.isRecurring() && e.getType() === 'expense');
}

function getDaysOfMonth(month) {
    const income = state.data.expenses
        .filter(e => e.getType() === 'income')
        .filter(e => e.isValidInMonth(state.date))
        .reduce((sum, e) => sum + e.computeMonthlyAmountChf(), 0);

    const recurringExpenses = state.data.expenses
        .filter(e => e.getType() === 'expense')
        .filter(e => e.isRecurring())
        .filter(e => e.isValidOnDate(state.date))
        .reduce((sum, e) => sum + e.computeMonthlyAmountChf(), 0);

    const availableAmount = income - recurringExpenses;
    const onetimeExpenses = getOnetimeExpenses();

    let days = [];
    let hasExpenses = false;
    let date = new Date(month.getFullYear(), month.getMonth(), 1);
    while (date.getMonth() === month.getMonth()) {
        const day = onetimeExpenses
            .filter(e => e.isValidOnDate(date))
            .reduce((day, e) => {
                hasExpenses = true;
                day.amount += e.computeAmountChf();
                const firstHashPosition = e.getDescription().indexOf('#');
                const dealer = e.getDescription().substr(0, firstHashPosition === -1 ? undefined : firstHashPosition).trim();
                if (!day.description.includes(dealer)) {
                    day.description.push(dealer);
                }
                return day;
            }, { amount: 0, description: [] });

        const dayOfWeek = date.getDay();
        day.weekend = dayOfWeek === 6 || dayOfWeek === 0;
        day.index = date.getDate();
        day.date = new Date(date.getTime());

        days.push(day);

        date.setDate(date.getDate() + 1);
    }
    if (!hasExpenses) {
        return {};
    }

    const numDays = days.length;
    days
        .filter(day => day.date <= constants.today)
        .forEach(day => day.saved = availableAmount / numDays - day.amount);
    return days;
}

export { getDaysOfMonth };
