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
            html += App.renderHeading('h4', year, yearObj.total);
            html += '<div class="mb-2">';
            const months = Object.keys(yearObj.months).sort(App.reverseCompareString());
            for (const month of months) {
                const monthObj = yearObj.months[month];
                html += App.renderHeading('h5', constants.monthOnlyFormat.format(new Date(`${year}-${month}`)), monthObj.total);
                html += '<div class="mb-1">';
                for (const position of monthObj.docs.sort(App.reverseCompareString(d => d.date))) {
                    html += App.renderPositionRow(position, l => constants.daySearchResultFormat.format(new Date(position.date)) + '&nbsp;' + l);
                }
                html += '</div>';
            }
            html += '</div>';
        }
    }
    return html + '</div>';
}

export { render };
