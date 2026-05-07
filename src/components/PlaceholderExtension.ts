import { Node, mergeAttributes } from '@tiptap/core';

export const PlaceholderNode = Node.create({
  name: 'customPlaceholder',

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: element => element.getAttribute('data-key'),
        renderHTML: attributes => {
          if (!attributes.key) {
            return {};
          }

          return {
            'data-key': attributes.key,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-placeholder]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-placeholder': '',
        class: 'custom-placeholder-node',
      }),
      `{{${HTMLAttributes.key}}}`,
    ];
  },

  addCommands() {
    return {
      replacePlaceholder:
        (key: string, content: string) =>
        ({ tr, state, dispatch }) => {
          let range: { from: number; to: number } | null = null;
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'customPlaceholder' && node.attrs.key === key) {
              if (dispatch) {
                tr.replaceWith(pos, pos + node.nodeSize, state.schema.text(content));
                range = { from: pos, to: pos + content.length };
              }
              return false;
            }
          });
          return range;
        },
      convertTextToPlaceholders:
        () =>
        ({ tr, state, dispatch }) => {
          let hasChanges = false;
          state.doc.descendants((node, pos) => {
            if (node.isText && node.text) {
              const regex = /\{\{([^}]+)\}\}/g;
              let match;
              while ((match = regex.exec(node.text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                const key = match[1];
                if (dispatch) {
                  tr.replaceWith(start, end, this.type.create({ key }));
                  hasChanges = true;
                }
              }
            }
          });
          return hasChanges;
        },
    };
  },

  addInputRules() {
    return [
      {
        find: /\{\{([^}]+)\}\}\s$/,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const key = match[1];
          if (key) {
            tr.replaceWith(range.from, range.to, this.type.create({ key }));
          }
        },
      },
    ];
  },

  addPasteRules() {
    return [
      {
        find: /\{\{([^}]+)\}\}/g,
        handler: ({ state, range, match }) => {
          const { tr } = state;
          const key = match[1];
          if (key) {
            tr.replaceWith(range.from, range.to, this.type.create({ key }));
          }
        },
      },
    ];
  },
});
