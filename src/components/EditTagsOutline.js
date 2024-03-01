import { loadTag, storeTag } from "../services/TagService";
import { useCallback, useContext, useState } from "react";

import { DbContext } from "./Database";
import Outline from "./Outline";
import TagContextProvider from "./TagContextProvider";
import TagDimension from "../enums/TagDimension";
import TagForm from "./TagForm";
import TagPill from "./TagPill";
import t from "../utils/texts";

function TagLine({ tag, subHierarchy, setEditedTag }) {
  let children = null;
  if (subHierarchy) {
    children = <TagHierarchy tags={subHierarchy} setEditedTag={setEditedTag} />
  }
  return <li>
    {<TagPill name={tag} onClick={() => setEditedTag(tag)} />}
    {children}
  </li>
}

function TagHierarchy({ tags, setEditedTag }) {
  return <ul>
    {Object.entries(tags).map(([k, v]) => <TagLine key={k} tag={k} subHierarchy={v} setEditedTag={setEditedTag} />)}
  </ul>;
}

function TagsInternal({ setEditedTag }) {
  // Helper component, because the Tags context is only defined inside the outline
  const { tags } = useContext(TagContextProvider.Context);
  if (!tags) {
    return 'FIXME suspense Keine Tags definiert';
  }

  return Object.values(TagDimension).map(d => <div key={d}>
    <h1>{d}</h1>
    <TagHierarchy tags={tags.hierarchy[d]} setEditedTag={setEditedTag} />
  </div>);
}

export default function EditTagsOutline({ isSidebarCollapsed, toggleSidebar, unsyncedDocuments }) {
  const [editedTag, setEditedTagInternal] = useState(null);
  const db = useContext(DbContext);

  // FIXME when clicking a pill when another is already open, only the title changes
  const setEditedTag = useCallback(async id => setEditedTagInternal(await loadTag(db, id)), [db, setEditedTagInternal]);
  const saveAction = useCallback(tag => {
    setEditedTagInternal(null);
    storeTag(db, tag);
  }, [setEditedTagInternal, db]);

  // FIXME closing form is too abrupt
  return <Outline
    isSidebarCollapsed={isSidebarCollapsed}
    toggleSidebar={toggleSidebar}
    navbarBrandContent={<><i className="bi bi-tags-fill"></i> {t('EditTags')}</>}
    navbarFormContent={unsyncedDocuments}
    main={<TagsInternal setEditedTag={setEditedTag} />}
    rightDrawer={editedTag ? <TagForm editedTag={editedTag} saveAction={saveAction} abortAction={() => setEditedTagInternal(null)} /> : null}
    rightDrawerVisible={!!editedTag} />
}
