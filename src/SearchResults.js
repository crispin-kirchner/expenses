import state from "./state";

function render() {
    let html = '';
    if (!state.searchData) {
        return html;
    }

    for (const yearEntry of Object.entries(state.searchData)) {
        const year = yearEntry[0];
        html += `<h3>${year}</h3>`;
        for (const position of yearEntry[1]) {
            html += `<div>${position.date} ${position.description} ${position.amount}</div>`;
        }
    }
    return html;
}

export { render };
