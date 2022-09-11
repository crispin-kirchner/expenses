import * as App from './App';
import * as constants from './constants';
import * as positions from './positions';

import state from "./state";

function render() {
    positions.refreshSearchData();
    let html = '<div class="mt-content col-lg-8">';
    if (state.searchData.data) {
        const years = Object.keys(state.searchData.data).sort(App.reverseCompareString());
        for (const year of years) {
            const yearObj = state.searchData.data[year];
            html += `
                <h4 class="d-flex">
                    <span class="me-auto">${year}</span>
                    <span>${App.renderFloat(yearObj.total)}</span>
                </h4>`;
            const months = Object.keys(yearObj.months).sort(App.reverseCompareString());
            for (const month of months) {
                const monthObj = yearObj.months[month];
                html += `
                    <h5 class="d-flex">
                        <span class="me-auto">${constants.monthOnlyFormat.format(new Date(`${year}-${month}`))}</span>
                        <span>${App.renderFloat(monthObj.total)}</span>
                    </h5>
                    <div class="mb-1">`;
                for (const position of monthObj.docs.sort(App.reverseCompareString(d => d.date))) {
                    html += `
                        <div class="d-flex cursor-pointer xpns-hover border-top py-1 ${position._id === state.editedPosition.data?._id ? 'active' : ''}" data-xpns-id="${position._id || ''}">
                            <span class="me-auto">${constants.daySearchResultFormat.format(new Date(position.date))} ${App.decorateTags(position.description)}</span>
                            <span>${App.renderFloat(position.amount)}</span>
                        </div>`;
                }
                html += '</div>';
            }
        }
    }
    return html + '</div>';
}

export { render };
