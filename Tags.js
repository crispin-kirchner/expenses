import state from './state.js'
import * as colors from './colors.js';
import * as constants from './constants.js';

const dimensions = [constants.standardDimension, constants.unspecificDimension];

function getIndexByName(name) {
    return state.data.categories.findIndex(c => c.name === name);
}

function getByName(name) {
    const index = getIndexByName(name);
    if (index < 0) {
        return {
            name: name,
            color: constants.defaultTagColor,
            parent: constants.unspecificDimension
        };
    }
    return state.data.categories[index];
}

function render(tagName, additionalClasses) {
    const tag = getByName(tagName)
    const classes = colors.getClasses(tag.color);
    return `<span class="badge ${classes.join(' ')} ${additionalClasses ? additionalClasses : ''}" data-xpns-tag="${tagName}">${tagName}</span>`;
}

function getHierarchyRecursive(parent) {
    const categories = state.data.categories.filter(c => c.parent === parent);

    return categories.reduce((acc, c) => {
        acc[c.name] = getHierarchyRecursive(c.name);
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
    visitHierarchyRecursive(visitor, getHierarchy(), 0);
}

function getHierarchy() {
    const hierarchy = dimensions.reduce((acc, d) => {
        acc[d] = getHierarchyRecursive(d);
        return acc;
    }, {});

    // add undefined names
    const allDefinedNames = state.data.categories.map(c => c.name);

    getAllNames()
        .filter(n => !allDefinedNames.includes(n))
        .forEach(n => hierarchy[constants.unspecificDimension][n] = {});

    return hierarchy;
}

function getAllNames() {
    const set = new Set(state.data.expenses.flatMap(e => e.getTags()));
    return [...set];
}

function renderCategoryHierarchyRecursive(hierarchy, renderSelf, renderSubHierarchy, level) {
    const entries = Object.entries(hierarchy)
        .map(e => {
            const subHierarchy = renderCategoryHierarchyRecursive(e[1], renderSelf, renderSubHierarchy, level + 1);
            return renderSelf(e[0], subHierarchy, level);
        })
        .join('\n');

    return renderSubHierarchy(entries, level);
}

function renderCategoryHierarchy(renderSelf, renderSubHierarchy) {
    return renderCategoryHierarchyRecursive(getHierarchy(), renderSelf, renderSubHierarchy, 0);
}

export { getByName, render, getIndexByName, renderCategoryHierarchy, visitHierarchy };
