const state = {
    saved: true,
    edit: null,
    new: false,
    expandedPaths: {},
    viewMode: 'monthDisplay',
    monthDisplay: localStorage.getItem('monthDisplay') || 'overview',
    chartTags: [],
    date: new Date(Date.now()),
    proposalSelection: false,
    descriptionCaretPosition: null,
    data: {
        version: 2,
        expenses: [],
        categories: []
    }
};

export default state;
