import React, { useCallback, useState } from "react";

import Database from "./Database";
import { getTagsAndHierarchy } from "../services/TagService";

const Context = React.createContext(null);

export default function Tags({ children }) {
  const [tags, setTags] = useState(null);

  const queryCallback = useCallback(async db => {
    setTags(await getTagsAndHierarchy(db));
  }, []);

  return (
    <Database.LiveQuery queryCallback={queryCallback}>
      <Context.Provider value={tags}>
        {children}
      </Context.Provider>
    </Database.LiveQuery>
  );
}

Tags.Context = Context;
