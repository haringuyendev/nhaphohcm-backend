// components/Property/admin/Create/LexicalToolbar.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Bold, Italic, Link, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TOGGLE_LINK_COMMAND } from '@lexical/link'
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical'

export default function LexicalToolbar() {
  const [editor] = useLexicalComposerContext()
  const [linkUrl, setLinkUrl] = useState('')
  const [open, setOpen] = useState(false)

  const insertLink = () => {
    if (!linkUrl.trim()) return
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: linkUrl.trim() })
    setLinkUrl('')
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-1 p-3 border-b bg-muted/50 flex-wrap">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="ghost">
            <Link className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chèn liên kết</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertLink()}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button onClick={insertLink}>Chèn</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <div className="w-px h-8 bg-border mx-2" />

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  )
}