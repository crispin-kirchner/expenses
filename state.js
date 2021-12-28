const state = {
    saved: true,
    edit: null,
    new: false,
    expandedPaths: {},
    viewMode: 'monthDisplay',
    monthDisplay: 'chart',
    chartTags: [],
    date: new Date(Date.now()),
    overviewConfiguration: {
        typeFilter: ['income', 'recurring', 'expense']
    },
    proposalSelection: false,
    descriptionCaretPosition: null,
    data: {
        version: 2,
        expenses: [],
        categories: []
    }
};

export default state;
