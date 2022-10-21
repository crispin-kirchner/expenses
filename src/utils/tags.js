import TagDimension from '../enums/TagDimension.js';

const TAG_REGEX = /#(\p{Letter}+)\b/ug;

function getTags(text) {
    let m = null;
    const labels = [];
    while ((m = TAG_REGEX.exec(text))) {
        labels.push(m[1]);
    }
    return labels;
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

export { getRootTag, getTags, TAG_REGEX };
