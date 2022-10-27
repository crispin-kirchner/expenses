import TagDimension from '../enums/TagDimension.js';
import _ from 'lodash';

const TAG_REGEX = /#(\p{Letter}+)\b/ug;

function getTags(text) {
    let m = null;
    const tags = [];
    while ((m = TAG_REGEX.exec(text))) {
        tags.push(m[1]);
    }
    return tags;
}

function hasTag(text, tagName) {
    return getTags(text).includes(tagName);
}

function getRootTag(text, tagsFlat) {
    const standardLabels = Object.values(tagsFlat)
        .filter(c => c.parent === TagDimension.STANDARD);

    for (const label of standardLabels) {
        if (hasTag(text, label._id)) {
            return label._id;
        }
    }
}

function removeTagFromString(tag, description) {
    return description.replace(new RegExp(`\\s#${tag}(?:\\b|$)`), '');
}

function buildHierarchyRecursive(tagsFlat, parent) {
    const categories = _.filter(tagsFlat, tag => tag.parent === parent)

    return categories.reduce((acc, c) => {
        acc[c._id] = buildHierarchyRecursive(tagsFlat, c._id);
        return acc;
    }, {});
}

export { getRootTag, getTags, removeTagFromString, buildHierarchyRecursive, TAG_REGEX };
