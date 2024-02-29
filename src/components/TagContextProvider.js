import Database, { useDataVersion } from "./Database";
import React, { useCallback, useState } from "react";

import { getTagsAndHierarchy } from "../services/TagService";

const Context = React.createContext(null);

export default function TagContextProvider({ children }) {
  const [tags, setTags] = useState(null);

  const { dataVersion, incrementDataVersion } = useDataVersion();

  const queryCallback = useCallback(async db => {
    setTags(await getTagsAndHierarchy(db));
  }, []);

  return (
    <Database.LiveQuery queryCallback={queryCallback} dataVersion={dataVersion} >
      <Context.Provider value={{ tags, incrementDataVersion }}>
        {children}
      </Context.Provider>
    </Database.LiveQuery>
  );
}

TagContextProvider.Context = Context;
