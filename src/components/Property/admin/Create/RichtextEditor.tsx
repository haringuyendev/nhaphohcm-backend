// components/LexicalEditor.tsx
'use client'

import React from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import LexicalToolbar from './LexicalToolbar'
import { LinkNode } from '@payloadcms/richtext-lexical/client'
import LinkCommandPlugin from './LinkPlugin'

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


type Props = {
  initialValue?: any
  onChange: (json: any) => void
  placeholder?: string
}


export default function LexicalEditor({ initialValue, onChange, placeholder = "Nhập mô tả chi tiết..." }: Props) {
  // Add logic to load initialValue
  const config = {
    namespace: 'PropertyEditor',
    theme,
    onError: (error:any) => console.error(error),
    nodes: [
      LinkNode,           // QUAN TRỌNG NHẤT!
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
    ],
    editorState: initialValue
    ? (editor:any) => {
        try {
          const parsedState = editor.parseEditorState(initialValue)
          if (!parsedState.isEmpty()) {
            editor.setEditorState(parsedState)
          }
        } catch (e) {
          console.warn('Failed to parse initial editor state', e)
          // Không làm gì → Lexical sẽ tự tạo paragraph trống
        }
      }
    : null,
  }

  return (
    <LexicalComposer initialConfig={config}>
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
              const json = editorState.toJSON()
              console.log('Lexical State →', json)
              onChange(json) // vẫn gửi lên parent như cũ
            })
          }} />
          <HistoryPlugin />
          <ListPlugin />
          <LinkCommandPlugin />
        </div>
      </div>
    </LexicalComposer>
  )
}
