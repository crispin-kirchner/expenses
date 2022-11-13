import { buildHierarchyRecursive, getTags } from '../utils/tags.js';

import EntityType from '../enums/EntityType.js';
import TagDimension from '../enums/TagDimension.js';
import { getAllDocuments } from './db.js';

async function getAllNames() {
    const allPositions = await getAllDocuments(EntityType.POSITION);
    const set = new Set(allPositions.flatMap(e => getTags(e.description)));
    return [...set];
}

async function getHierarchy(tagsFlat) {
    const hierarchy = [TagDimension.STANDARD, TagDimension.UNSPECIFIC].reduce((acc, d) => {
        acc[d] = buildHierarchyRecursive(tagsFlat, d);
        return acc;
    }, {});

    // add undefined names
    const allDefinedNames = Object.keys(tagsFlat);

    const allNames = await getAllNames();
    allNames
        .filter(n => !allDefinedNames.includes(n))
        .forEach(n => hierarchy[TagDimension.UNSPECIFIC][n] = {});

    return hierarchy;
}

async function getTagsAndHierarchy() {
    const docs = await getAllDocuments(EntityType.TAG);
    const flat = docs.reduce((acc, doc) => {
        acc[doc._id] = doc;
        return acc;
    }, {});

    const hierarchy = await getHierarchy(flat);
    return {
        flat: flat,
        hierarchy: hierarchy
    };
}

export { getTagsAndHierarchy };
