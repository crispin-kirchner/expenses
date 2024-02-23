import React, { useContext } from 'react';

import Tags from './Tags.js';
import colors from '../enums/colors.js';

export default function Tag({ classes, name }) {
  const tags = useContext(Tags.Context);
  classes = classes || '';
  let tag = null;
  if (tags && (tag = tags.flat[name])) {
    classes += colors[tag.color].classes;
  }
  else {
    // FIXME prüfen wo es diesen default color noch braucht und vereinheitlichen
    classes += colors['grayWhite'].classes;
  }
  return (
    <span
      className={`badge ${classes}`}
      data-xpns-tag={name}>
      {name}
    </span>);
}
