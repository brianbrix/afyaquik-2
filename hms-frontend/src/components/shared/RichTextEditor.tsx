import React, { useRef, useEffect, forwardRef } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  theme?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  disabled?: boolean;
}

const RichTextEditor = forwardRef<any, RichTextEditorProps>(({
  value = '',
  onChange,
  placeholder = 'Enter text...',
  theme = 'snow',
  style,
  readOnly = false,
  disabled = false
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    // Dynamic import of ReactQuill to avoid SSR issues
    const loadEditor = async () => {
      const ReactQuill = (await import('react-quill')).default;
      const { default: Quill } = await import('quill');
      
      // Import CSS
      await import('react-quill/dist/quill.snow.css');

      if (editorRef.current && !quillRef.current) {
        const quill = new Quill(editorRef.current, {
          theme: theme,
          placeholder: placeholder,
          readOnly: readOnly || disabled,
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'align': [] }],
              ['link', 'image'],
              ['clean']
            ]
          }
        });

        quill.on('text-change', () => {
          if (onChange) {
            onChange(quill.root.innerHTML);
          }
        });

        quillRef.current = quill;
        
        // Set initial value
        if (value) {
          quill.root.innerHTML = value;
        }
      }
    };

    loadEditor();

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [theme, placeholder, readOnly, disabled]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!disabled);
    }
  }, [disabled]);

  // Expose quill instance via ref
  React.useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current,
    getValue: () => quillRef.current?.root.innerHTML || '',
    setValue: (val: string) => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = val;
      }
    }
  }));

  return (
    <div 
      ref={editorRef} 
      style={{
        minHeight: '120px',
        border: '1px solid #ced4da',
        borderRadius: '0.375rem',
        ...style
      }}
    />
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
