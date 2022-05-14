import * as App from './App.js';
import * as ViewMode from './ViewMode.js';

const state = {
    expandedPaths: {},
    viewMode: ViewMode.MONTH_DISPLAY,
    monthDisplay: localStorage.getItem(ViewMode.MONTH_DISPLAY) || 'overview',
    chartTags: [],
    date: new Date(Date.now()),
    proposalSelection: false,
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
    searchString: '',
    searchData: [],
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

function markEverythingDirty() {
    ['dayExpenses', 'daysOfMonth', 'overviewData', 'labels']
        .forEach(ds => state[ds].loadState = 'dirty');
}

export default state;
export { refreshData, markEverythingDirty };
