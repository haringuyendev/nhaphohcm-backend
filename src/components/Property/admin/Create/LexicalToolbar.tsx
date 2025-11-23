'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Bold, Italic, LinkIcon, List, ListOrdered, Undo, Redo, Unlink } from 'lucide-react' // Đổi Link thành LinkIcon để tránh conflict
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { FORMAT_TEXT_COMMAND } from 'lexical'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { $createLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $createTextNode, $insertNodes } from 'lexical'
import { LinkPayload } from 'node_modules/@payloadcms/richtext-lexical/dist/features/link/client/plugins/floatingLinkEditor/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface PayloadLinkOptions {
  linkType: 'custom';
  url: string;
  newTab: boolean;
  target?: string;
}

export default function LexicalToolbar() {
  const [editor] = useLexicalComposerContext()
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [newTab, setNewTab] = useState(true)
  const [isLink, setIsLink] = useState(false)

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = selection.getNodes()[0]
        if (node) {
          const parent = node.getParent()
          setIsLink($isLinkNode(parent) || $isLinkNode(node))
        }
      }
    })
  }, [editor])

  const insertLink = useCallback(() => {
    if (linkUrl.trim() === '') {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
      return
    }

    const payload: PayloadLinkOptions = {
      url: linkUrl,
      linkType: 'custom',
      target: newTab ? '_blank' : '_self',
      newTab
    }

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload)
    setLinkUrl('')
    setIsLinkDialogOpen(false)
  }, [editor, linkUrl, newTab])

  const handleLinkClick = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        const node = selection.getNodes()[0]
        if (node) {
          const parent = node.getParent()
          if ($isLinkNode(parent)) {
            setLinkUrl(parent.getURL())
            setNewTab(parent.getTarget() === '_blank')
          } else if ($isLinkNode(node)) {
            setLinkUrl(node.getURL())
            setNewTab(node.getTarget() === '_blank')
          }
        }
      }
    })
    setIsLinkDialogOpen(true)
  }

  const removeLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
  }, [editor])

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

      {isLink ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={removeLink}
          title="Remove link"
        >
          <Unlink className="w-4 h-4" />
        </Button>
      ) : (
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleLinkClick}
              title="Insert link"
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isLink ? 'Edit Link' : 'Insert Link'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      insertLink()
                    }
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-tab"
                  checked={newTab}
                  onCheckedChange={(checked) => setNewTab(Boolean(checked))}
                />
                <Label htmlFor="new-tab">Open in new tab</Label>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsLinkDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={insertLink}>Insert</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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