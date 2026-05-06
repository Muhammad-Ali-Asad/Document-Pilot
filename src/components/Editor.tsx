import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, Link, Image, Grid, MoreHorizontal, PenTool, ListTree, History, Settings } from 'lucide-react';
import { forwardRef, useImperativeHandle } from 'react';

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
      Placeholder.configure({
        placeholder: 'Start writing your content here...',
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    updatePlaceholder: (targetPlaceholder: string, newText: string) => {
      if (!editor) return;
      
      const html = editor.getHTML();
      
      // Simple string replacement for placeholders like [CONTRACT_NUMBER]
      // We wrap the new text in a span with a specific class just to highlight it briefly
      const replacementHtml = `<span style="background-color: #e8f0fe; color: #1a73e8; border-radius: 2px; padding: 0 4px; font-weight: bold;">${newText}</span>`;
      
      // Use split and join to replace all instances just in case
      const newHtml = html.split(targetPlaceholder).join(replacementHtml);
      
      if (html !== newHtml) {
        editor.commands.setContent(newHtml);
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
