import React, { forwardRef } from 'react';
import ReactQuill, { ReactQuillProps } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Forward ref to support parent ref usage
const RichTextEditor = forwardRef<any, ReactQuillProps>((props, ref) => (
  <ReactQuill ref={ref} {...props} />
));

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
