import { useCallback, useContext, useState } from "react";

import { DbContext } from "./Database";
import Outline from "./Outline";
import Tag from "./Tag";
import TagDimension from "../enums/TagDimension";
import TagForm from "./TagForm";
import Tags from "./Tags";
import { loadTag } from "../services/TagService";
import t from "../utils/texts";

function TagLine({ tag, subHierarchy, setEditedTag }) {
  let children = null;
  if (subHierarchy) {
    children = <TagHierarchy tags={subHierarchy} setEditedTag={setEditedTag} />
  }
  return <li>
    {<Tag name={tag} onClick={() => setEditedTag(tag)} />}
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
  const tags = useContext(Tags.Context);
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

  const setEditedTag = useCallback(async id => setEditedTagInternal(await loadTag(db, id)), [db, setEditedTagInternal]);

  return <Outline
    isSidebarCollapsed={isSidebarCollapsed}
    toggleSidebar={toggleSidebar}
    navbarBrandContent={<><i className="bi bi-tags-fill"></i> {t('EditTags')}</>}
    navbarFormContent={unsyncedDocuments}
    main={<TagsInternal setEditedTag={setEditedTag} />}
    rightDrawer={editedTag ? <TagForm editedTag={editedTag} abortAction={() => setEditedTagInternal(null)} /> : null}
    rightDrawerVisible={!!editedTag} />
}
