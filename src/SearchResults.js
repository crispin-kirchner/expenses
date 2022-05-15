import * as App from './App';
import * as constants from './constants';

import state from "./state";

function render() {
    // FIXME mt-content auslagern ein Level weiter hoch möglich?
    // FIXME aufräumen noch
    let html = '<div class="mt-content">';
    if (state.searchData) {
        const years = Object.keys(state.searchData).sort().reverse();
        for (const year of years) {
            const yearObj = state.searchData[year];
            html += `
                <h4 class="d-flex">
                    <span class="me-auto">${year}</span>
                    <span>${App.renderFloat(yearObj.total)}</span>
                </h4>`;
            const months = Object.keys(yearObj.months).sort().reverse();
            for (const month of months) {
                const monthObj = yearObj.months[month];
                html += `
                    <h5 class="d-flex">
                        <span class="me-auto">${constants.monthOnlyFormat.format(new Date(`${year}-${month}`))}</span>
                        <span>${App.renderFloat(monthObj.total)}</span>
                    </h5>`;
                for (const position of monthObj.docs) {
                    // FIXME Sortierung innerhalb Monat ist nicht gut
                    html += `
                        <div class="d-flex">
                            <span class="me-auto">${constants.daySearchResultFormat.format(new Date(position.date))} ${App.decorateTags(position.description)}</span>
                            <span>${App.renderFloat(position.amount)}</span>
                        </div>`;
                }
            }
        }
    }
    return html + '</div>';
}

export { render };
