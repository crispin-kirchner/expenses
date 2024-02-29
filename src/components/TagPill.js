import React, { useContext } from 'react';

import TagContextProvider from './TagContextProvider.js';
import colors from '../enums/colors.js';

export default function TagPill({ classes, name, onClick }) {
  const { tags } = useContext(TagContextProvider.Context);
  classes = classes || '';
  let tag = null;
  if (tags && (tag = tags.flat[name])) {
    classes += colors[tag.color].classes;
  }
  else {
    // FIXME prüfen wo es diesen default color noch braucht und vereinheitlichen
    classes += colors['grayWhite'].classes;
  }
  if (onClick) {
    classes += ' cursor-pointer';
  }
  return (
    <span
      className={`badge ${classes}`}
      data-xpns-tag={name}
      onClick={onClick}>
      {name}
    </span>);
}
