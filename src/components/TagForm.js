import React, { useContext, useState } from "react";

import { default as BForm } from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from "./Form";
import TagContextProvider from "./TagContextProvider";
import colors from "../enums/colors";
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
  const [color, setColor] = useState(editedTag.color);
  const { tags, incrementDataVersion } = useContext(TagContextProvider.Context);

  const saveActionInternal = () => {
    saveAction({
      ...editedTag,
      parent,
      color
    });
    incrementDataVersion();
  };

  return (
    <Form id="tag-form" title={_ => editedTag._id} abortAction={abortAction} saveAction={saveActionInternal}>
      <Form.Row>
        <FloatingLabel controlId="parent-input" label={t('Parent')}>
          <BForm.Select value={parent} onChange={evt => setParent(evt.target.value)}>
            <ParentOptions tagHierarchy={tags.hierarchy} lockedTags={[editedTag._id]} level={0} />
          </BForm.Select>
        </FloatingLabel>
      </Form.Row>
      <Form.Row>
        <BForm.Floating>
          <BForm.Select id="colorInput" className={`${colors[color].classes}}`} value={color} onChange={evt => setColor(evt.target.value)}>
            {Object.entries(colors)
              .sort((e1, e2) => e1[1].name.localeCompare(e2[1].name, navigator.language))
              .map(([name, def]) => <option key={name} className={`${def.classes} fw-bold`} value={name}>{def.name}</option>)}
          </BForm.Select>
          <label className={colors.getTextClass(color)} htmlFor="colorInput">{t('Color')}</label>
        </BForm.Floating>
      </Form.Row>
    </Form>
  );
};
