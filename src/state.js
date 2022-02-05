import * as App from './App.js';

const state = {
    expandedPaths: {},
    viewMode: 'monthDisplay',
    monthDisplay: localStorage.getItem('monthDisplay') || 'overview',
    chartTags: [],
    date: new Date(Date.now()),
    proposalSelection: false,
    descriptionCaretPosition: null,
    form: null,
    dayExpenses: {
        loadState: 'dirty',
        data: {
            expenses: [],
            sum: 0
        }
    },
    daysOfMonth: {
        loadState: 'dirty',
        data: {}
    },
    overviewData: {
        loadState: 'dirty',
        data: []
    },
    labels: {
        loadState: 'dirty',
        data: {
            flat: [],
            hierarchy: {}
        }
    },
    editedPosition: {
        loadState: 'loaded',
        data: null
    },
    editedLabelId: null
};

async function refreshData(dataset, loadFn) {
    if (state[dataset].loadState === 'dirty') {
        state[dataset].loadState = 'loading';

        state[dataset].data = await loadFn();
        state[dataset].loadState = 'loaded';
        App.render();
    }
}

export default state;
export { refreshData };
