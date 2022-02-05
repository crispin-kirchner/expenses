import * as colors from './colors.js';
import * as constants from './constants.js';
import * as db from './db.js';
import * as expenses from './expenses.js';

import state, { refreshData } from './state.js'

import { getAllPositions } from './expenses.js';

const dimensions = [constants.standardDimension, constants.unspecificDimension];

function getIndexByName(name) {
    return state.labels.data.flat.findIndex(c => c._id === name);
}

function prepareCreate(name) {
    return {
        entity: 'label',
        _id: name,
        color: constants.defaultLabelColor,
        parent: constants.unspecificDimension
    };
}

function getByName(name) {
    const index = getIndexByName(name);
    if (index < 0) {
        return prepareCreate(name);
    }
    return state.labels.data.flat[index];
}

function render(labelName, additionalClasses) {
    const label = getByName(labelName)
    const classes = colors.getClasses(label.color);
    return `<span class="badge ${classes.join(' ')} ${additionalClasses ? additionalClasses : ''}" data-xpns-tag="${labelName}">${labelName}</span>`;
}

function getHierarchyRecursive(parent) {
    const categories = state.labels.data.flat.filter(c => c.parent === parent);

    return categories.reduce((acc, c) => {
        acc[c._id] = getHierarchyRecursive(c._id);
        return acc;
    }, {});
}

function visitHierarchyRecursive(visitor, subHierarchy, level) {
    for (const [name, children] of Object.entries(subHierarchy)) {
        visitor(name, level, children);
        visitHierarchyRecursive(visitor, children, level + 1);
    }
}

function visitHierarchy(visitor) {
    visitHierarchyRecursive(visitor, state.labels.data.hierarchy, 0);
}

async function getHierarchy() {
    const hierarchy = dimensions.reduce((acc, d) => {
        acc[d] = getHierarchyRecursive(d);
        return acc;
    }, {});

    // add undefined names
    const allDefinedNames = state.labels.data.flat.map(c => c._id);

    const allNames = await getAllNames();
    allNames
        .filter(n => !allDefinedNames.includes(n))
        .forEach(n => hierarchy[constants.unspecificDimension][n] = {});

    return hierarchy;
}

async function getAllNames() {
    const allPositions = await expenses.getAllPositions()
    const set = new Set(allPositions.flatMap(e => expenses.getLabels(e)));
    return [...set];
}

function refresh() {
    refreshData('labels', getLabelsAndHierarchy);
}

async function getAllLabels() {
    return await db.getAllDocuments('label')
}

async function getLabelsAndHierarchy() {
    const flat = await getAllLabels();
    state.labels.data = { flat: flat };

    const hierarchy = await getHierarchy();
    return {
        flat: flat,
        hierarchy: hierarchy
    };
}

function store(label) {
    state.labels.loadState = 'dirty';
    state.dayExpenses.loadState = 'dirty';
    state.overviewData.loadState = 'dirty';
    state.daysOfMonth.loadState = 'dirty';
    db.put(label);
}

export { getByName, render, getIndexByName, visitHierarchy, refresh, store };
