import { useCallback, useState } from "react";

import Database from "./Database";
import TagContext from "./TagContext";
import { getTagsAndHierarchy } from "../services/TagService";

export default function TagQuery({ children }) {
    const [tags, setTags] = useState(null);

    const queryCallback = useCallback(async db => {
        setTags(await getTagsAndHierarchy(db));
    }, []);

    return (
        <Database.LiveQuery queryCallback={queryCallback}>
            <TagContext.Provider value={tags}>
                {children}
            </TagContext.Provider>
        </Database.LiveQuery>
    );
}
