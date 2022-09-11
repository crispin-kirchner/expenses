import * as App from './App.js';
import * as LoadState from './LoadState.js';
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
        loadState: LoadState.DIRTY,
        data: {
            expenses: [],
            sum: 0
        }
    },
    daysOfMonth: {
        loadState: LoadState.DIRTY,
        data: {}
    },
    overviewData: {
        loadState: LoadState.DIRTY,
        data: []
    },
    searchString: '',
    searchData: {
        loadState: LoadState.DIRTY,
        data: {}
    },
    labels: {
        loadState: LoadState.DIRTY,
        data: {
            flat: [],
            hierarchy: {}
        }
    },
    editedPosition: {
        loadState: LoadState.LOADED,
        data: null
    },
    editedLabelId: null
};

async function refreshData(dataset, loadFn, keepNavbar) {
    if (state[dataset].loadState === LoadState.DIRTY) {
        state[dataset].loadState = LoadState.LOADING;

        state[dataset].data = await loadFn();
        state[dataset].loadState = LoadState.LOADED;
        App.render(keepNavbar);
    }
}

function markEverythingDirty() {
    ['dayExpenses', 'daysOfMonth', 'overviewData', 'labels', 'searchData']
        .forEach(ds => state[ds].loadState = LoadState.DIRTY);
}

function updateSearchString(value) {
    state.searchString = value;
    state.searchData.loadState = LoadState.DIRTY;
}

export default state;
export { refreshData, markEverythingDirty, updateSearchString };
