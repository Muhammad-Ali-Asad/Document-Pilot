import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, Link, Image, Grid, MoreHorizontal, PenTool, ListTree, History, Settings } from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';

import { PlaceholderNode } from './PlaceholderExtension';
import { HighlightExtension } from './HighlightExtension';

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export interface EditorRef {
  updatePlaceholder: (id: string, text: string) => void;
}

const Editor = forwardRef<EditorRef, EditorProps>(({ initialContent, onChange }, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      PlaceholderNode,
      HighlightExtension,
      Placeholder.configure({
        placeholder: 'Start writing your content here...',
      }),
    ],
    content: initialContent,
    onCreate: ({ editor }) => {
      (editor.commands as any).convertTextToPlaceholders();
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    updatePlaceholder: (targetPlaceholder: string, newText: string) => {
      if (!editor) return;
      
      const key = targetPlaceholder.replace(/\{\{|\}\}|\[|\]/g, '');

      // Try replacing via custom node command first
      const range = (editor.commands as any).replacePlaceholder(key, newText);
      
      if (range) {
        // Highlight and Scroll
        (editor.commands as any).setHighlight(range.from, range.to);
        editor.commands.scrollIntoView();
      } else {
        // Fallback for raw text placeholders if they weren't converted to nodes
        const { state, view } = editor;
        const { tr } = state;
        let foundRange: { from: number; to: number } | null = null;

        state.doc.descendants((node, pos) => {
          if (node.isText && node.text?.includes(targetPlaceholder)) {
            const start = pos + node.text.indexOf(targetPlaceholder);
            const end = start + targetPlaceholder.length;
            tr.replaceWith(start, end, state.schema.text(newText));
            foundRange = { from: start, to: start + newText.length };
            return false;
          }
        });

        if (foundRange) {
          view.dispatch(tr);
          (editor.commands as any).setHighlight(foundRange.from, foundRange.to);
          editor.commands.scrollIntoView();
        }
      }
    }
  }));

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-container-main">
      {/* Vertical Toolbar Sidebar */}
      <div className="editor-sidebar">
        <div className="sidebar-item active">
          <PenTool size={20} />
          <span>Editor</span>
        </div>
        <div className="sidebar-item">
          <ListTree size={20} />
          <span>Outline</span>
        </div>
        <div className="sidebar-item">
          <History size={20} />
          <span>Versions</span>
        </div>
        <div className="sidebar-item" style={{ marginTop: 'auto', marginBottom: '20px' }}>
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="editor-content-area">
        {/* Top Formatting Toolbar */}
        <div className="editor-top-toolbar">
          <div className="toolbar-select">
            <span>Heading 1</span>
            <span className="arrow-down">▼</span>
          </div>
          
          <div className="toolbar-divider"></div>
          
          <button 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tool-btn ${editor.isActive('bold') ? 'active' : ''}`}
          >
            <Bold size={16} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tool-btn ${editor.isActive('italic') ? 'active' : ''}`}
          >
            <Italic size={16} />
          </button>
          <button className="tool-btn">
            <Underline size={16} />
          </button>
          <button className="tool-btn">
            <Strikethrough size={16} />
          </button>

          <div className="toolbar-divider"></div>
          
          <button 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tool-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tool-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          >
            <ListOrdered size={16} />
          </button>
          <button className="tool-btn">
            <AlignLeft size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button className="tool-btn">
            <Link size={16} />
          </button>
          <button className="tool-btn">
            <Image size={16} />
          </button>
          <button className="tool-btn">
            <Grid size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button className="tool-btn">
            <MoreHorizontal size={16} />
          </button>
        </div>
        
        {/* ProseMirror Wrapper */}
        <div className="tiptap-flat-page">
          <EditorContent editor={editor} />
        </div>

        {/* Footer Status Bar */}
        <div className="editor-footer-status">
          Words: {editor.getText().split(' ').filter(w => w.length > 0).length} &nbsp;&nbsp; Characters: {editor.getText().length}
        </div>
      </div>
    </div>
  );
});

export default Editor;
