import { useContext, useState } from "react";

import { default as BForm } from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from "./Form";
import Tags from "./Tags";
import t from '../utils/texts';

const NBSP = '\u00A0';

function ParentOptions({ tagHierarchy, lockedTags, level }) {
  return Object.entries(tagHierarchy)
    .map(([k, v]) => <>
      <option key={k} value={k} disabled={lockedTags.includes(k)}>{NBSP.repeat(level * 2)}{k}</option>
      {v ? <ParentOptions tagHierarchy={v} lockedTags={lockedTags.includes(k) ? Object.keys(v) : lockedTags} level={level + 1} /> : null}
    </>);
}

export default function TagForm({ editedTag, abortAction }) {
  const [parent, setParent] = useState(editedTag.parent);
  const tags = useContext(Tags.Context);

  return <Form title={classes => editedTag._id} abortAction={abortAction}>
    <Form.Row>
      <FloatingLabel controlId="parent-input" label={t('Parent')}>
        <BForm.Select value={parent} onChange={evt => setParent(evt.target.value)}>
          {tags ? <ParentOptions tagHierarchy={tags.hierarchy} lockedTags={[editedTag._id]} level={0} /> : null}
        </BForm.Select>
      </FloatingLabel>
    </Form.Row>
  </Form>;
};
