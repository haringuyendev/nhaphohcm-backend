// components/LexicalEditor.tsx
'use client'

import React from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from '@lexical/markdown'
import { CodeNode, CodeHighlightNode } from '@lexical/code'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { LinkNode } from '@lexical/link'
import LexicalToolbar from './LexicalToolbar'


const theme = {
  paragraph: 'mb-4 text-base leading-relaxed',
  heading: {
    h1: 'text-3xl font-bold mb-4',
    h2: 'text-2xl font-bold mb-3',
    h3: 'text-xl font-semibold mb-3',
  },
  list: { ul: 'list-disc pl-6 mb-4', ol: 'list-decimal pl-6 mb-4' },
  quote: 'border-l-4 border-primary pl-4 italic my-6 text-muted-foreground',
  code: 'bg-muted px-1 py-0.5 rounded text-sm',
}
// FIX: Tạo LinkNode an toàn, tránh crash khi url null
class SafeLinkNode extends LinkNode {
  static importJSON(serializedNode: any): SafeLinkNode {
    const node = super.importJSON(serializedNode)
    // Nếu url rỗng hoặc null → set mặc định
    if (!node.__url || node.__url.trim() === '') {
      node.__url = 'https://'
    }
    return node
  }

  exportJSON() {
    return super.exportJSON()
  }
}
const baseEditorConfig = {
  namespace: 'PropertyEditor',
  theme,
  onError: (error: Error) => console.error('[Lexical]', error),
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    SafeLinkNode,
    CodeNode,
    CodeHighlightNode,
  ],
}

type Props = {
  initialValue?: any
  onChange: (json: any) => void
  placeholder?: string
}


export default function LexicalEditor({ initialValue, onChange, placeholder = "Nhập mô tả chi tiết..." }: Props) {
    // Add logic to load initialValue
    const initialConfig = {
    ...baseEditorConfig,
    editorState: (editor: any) => {
      if (!initialValue) return;

      try {
        // nếu initialValue là JSON object thì load
        const parsed = editor.parseEditorState(
          typeof initialValue === "string"
            ? initialValue
            : JSON.stringify(initialValue)
        );
        editor.setEditorState(parsed);
      } catch (err) {
        console.error("Parse Lexical failed:", err);
      }
    },
  };


  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border rounded-lg overflow-hidden shadow-sm">
        {/* Use the self-built Toolbar */}
        <LexicalToolbar />

        <div className="relative bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-96 p-6 prose prose-lg max-w-none focus:outline-none" />
            }
            placeholder={
              <div className="absolute top-6 left-6 text-muted-foreground pointer-events-none select-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={({ children }) => (
              <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded">
                {children}
              </div>
            )}
          />
          <OnChangePlugin onChange={(editorState) => {
            editorState.read(() => {
              // Send JSON data to the parent component's onChange function
              onChange(editorState.toJSON())
            })
          }} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </div>
    </LexicalComposer>
  )
}
