import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const HighlightExtension = Extension.create({
  name: 'highlight',

  addStorage() {
    return {
      highlights: [] as { from: number; to: number; id: number }[],
    };
  },

  addCommands() {
    return {
      setHighlight:
        (from: number, to: number) =>
        ({ editor }) => {
          const id = Date.now();
          this.storage.highlights.push({ from, to, id });
          editor.view.dispatch(editor.state.tr.setMeta('highlight-added', id));
          
          setTimeout(() => {
            this.storage.highlights = this.storage.highlights.filter(h => h.id !== id);
            if (editor.view && !editor.isDestroyed) {
                editor.view.dispatch(editor.state.tr.setMeta('highlight-removed', id));
            }
          }, 2000);
          
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const { storage } = this;
    return [
      new Plugin({
        key: new PluginKey('highlight'),
        props: {
          decorations(state) {
            const { highlights } = storage;
            if (!highlights.length) return DecorationSet.empty;

            return DecorationSet.create(
              state.doc,
              highlights.map(h =>
                Decoration.inline(h.from, h.to, {
                  class: 'highlight-flash',
                })
              )
            );
          },
        },
      }),
    ];
  },
});
