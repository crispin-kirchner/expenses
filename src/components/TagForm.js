import React, { useContext, useState } from "react";

import { default as BForm } from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from "./Form";
import TagContextProvider from "./TagContextProvider";
import t from '../utils/texts';

const NBSP = '\u00A0';

function ParentOptions({ tagHierarchy, lockedTags, level }) {
  return Object.entries(tagHierarchy)
    .map(([k, v]) => <React.Fragment key={k}>
      <option value={k} disabled={lockedTags.includes(k)}>{NBSP.repeat(level * 2)}{k}</option>
      {v ? <ParentOptions tagHierarchy={v} lockedTags={lockedTags.includes(k) ? Object.keys(v) : lockedTags} level={level + 1} /> : null}
    </React.Fragment>);
}

export default function TagForm({ editedTag, abortAction, saveAction }) {
  const [parent, setParent] = useState(editedTag.parent);
  const { tags, incrementDataVersion } = useContext(TagContextProvider.Context);

  const saveActionInternal = () => {
    saveAction({
      ...editedTag,
      parent
    });
    incrementDataVersion();
  };

  return <Form id="tag-form" title={classes => editedTag._id} abortAction={abortAction} saveAction={saveActionInternal}>
    <Form.Row>
      <FloatingLabel controlId="parent-input" label={t('Parent')}>
        <BForm.Select value={parent} onChange={evt => setParent(evt.target.value)}>
          {tags ? <ParentOptions tagHierarchy={tags.hierarchy} lockedTags={[editedTag._id]} level={0} /> : null}
        </BForm.Select>
      </FloatingLabel>
    </Form.Row>
  </Form>;
};
