import EntityType from '../enums/EntityType.js';
import TagDimension from '../enums/TagDimension.js';
import _ from 'lodash';
import { buildHierarchyRecursive } from '../utils/tags.js';

async function getHierarchy(tagsFlat) {
  const hierarchy = [TagDimension.STANDARD, TagDimension.UNSPECIFIC].reduce((acc, d) => {
    acc[d] = buildHierarchyRecursive(tagsFlat, d);
    return acc;
  }, {});

  // TODO add undefined names only for manageTags, not generally
  /*
  const allDefinedNames = Object.keys(tagsFlat);

  const allNames = await getAllNames();
  allNames
      .filter(n => !allDefinedNames.includes(n))
      .forEach(n => hierarchy[TagDimension.UNSPECIFIC][n] = {});*/

  return hierarchy;
}

export async function getTagsAndHierarchy(db) {
  const docs = await db.getAllDocuments(EntityType.TAG);
  const flat = _.keyBy(docs, '_id');

  const hierarchy = await getHierarchy(flat);
  return { flat, hierarchy };
}

export function loadTag(db, id) {
  return db.getDocument(EntityType.TAG, id);
}
