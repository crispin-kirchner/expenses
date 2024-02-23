import { useContext, useState } from "react";

import Outline from "./Outline";
import Tag from "./Tag";
import TagDimension from "../enums/TagDimension";
import Tags from "./Tags";
import t from "../utils/texts";

function TagLine({ tag, subHierarchy }) {
  let children = null;
  if (subHierarchy) {
    children = <TagHierarchy tags={subHierarchy} />
  }
  return <li>
    {<Tag name={tag} />}
    {children}
  </li>
}

function TagHierarchy({ tags }) {
  return <ul>
    {Object.entries(tags).map(([k, v]) => <TagLine key={k} tag={k} subHierarchy={v} />)}
  </ul>;
}

function TagsInternal() {
  // Helper component, because the Tags context is only defined inside the outline
  const tags = useContext(Tags.Context);
  if (!tags) {
    return 'FIXME suspense Keine Tags definiert';
  }

  return Object.values(TagDimension).map(d => <>
    <h1>{d}</h1>
    <TagHierarchy tags={tags.hierarchy[d]} />
  </>);
}

export default function EditTagsOutline({ isSidebarCollapsed, toggleSidebar, unsyncedDocuments }) {
  return <Outline
    isSidebarCollapsed={isSidebarCollapsed}
    toggleSidebar={toggleSidebar}
    navbarBrandContent={<><i className="bi bi-tags-fill"></i> {t('EditTags')}</>}
    navbarFormContent={unsyncedDocuments}
    main={<TagsInternal />} />
}
