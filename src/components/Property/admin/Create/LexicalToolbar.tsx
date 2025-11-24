'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Bold, Italic, LinkIcon, List, ListOrdered, Undo, Redo, Unlink } from 'lucide-react' // Đổi Link thành LinkIcon để tránh conflict
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createTextNode, FORMAT_TEXT_COMMAND } from 'lexical'
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list'
import { UNDO_COMMAND, REDO_COMMAND } from 'lexical'
import {
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { $createLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@payloadcms/richtext-lexical/client'
type LinkPayload = {
  fields: {
    url: string;
    newTab: boolean;
    linkType: 'custom' | 'internal';
  },
  selectedNodes: any[],
  text: string
}
// === THÊM MỚI: Danh sách scheme được phép giữ nguyên (tel:, mailto:, sms:, ...) ===
const ALLOWED_SCHEMES = [
  'http:',
  'https:',
  'tel:',
  'mailto:',
  'sms:',
  'viber:',
  'whatsapp:',
  'zalo:',
  'tg:',        // Telegram
  'facetime:',
  'zoommtg:',
]

const hasValidScheme = (url: string): boolean => {
  const lower = url.toLowerCase().trim()
  return ALLOWED_SCHEMES.some(scheme => lower.startsWith(scheme))
}
// === KẾT THÚC PHẦN THÊM ===
export default function LexicalToolbar() {
  const [editor] = useLexicalComposerContext()
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [newTab, setNewTab] = useState(true)
  const [hasActiveLink, setHasActiveLink] = useState(false) // ← QUAN TRỌNG: trạng thái này riêng
  const [text, setText] = useState('')
  // Hàm kiểm tra selection hiện tại có nằm trong link không
  const updateLinkState = useCallback(() => {
    let hasLink = false
    let url = ''
    let target = true

    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) && selection.getTextContent() !== '') {
        const anchorNode = selection.anchor.getNode()
        const focusNode = selection.focus.getNode()
        const anchorParent = anchorNode.getParent()
        const focusParent = focusNode.getParent()

        const linkNode =
          $isLinkNode(anchorParent) ? anchorParent :
            $isLinkNode(focusParent) ? focusParent :
              $isLinkNode(anchorNode) ? anchorNode :
                $isLinkNode(focusNode) ? focusNode : null

        if (linkNode) {
          hasLink = true
          url = linkNode.getFields()?.url || ''
          target = linkNode.getFields()?.newTab ?? true
        }
      }
    })

    setHasActiveLink(hasLink)
    if (hasLink) {
      setLinkUrl(url)
      setNewTab(target)
    } else {
      // Khi không có link → reset URL để tạo mới
      setLinkUrl('')
      setNewTab(true)
    }
  }, [editor])

  // Cập nhật trạng thái khi selection thay đổi
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateLinkState()
      })
    })
  }, [editor, updateLinkState])

  const insertOrUpdateLink = useCallback(() => {
    if (!linkUrl?.trim() || linkUrl.trim() === 'https://') {
      // XÓA LINK
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach((node) => {
            const parent = node.getParent()
            if ($isLinkNode(parent)) parent.remove()
            else if ($isLinkNode(node)) node.remove()
          })
        }
      })
      setIsLinkDialogOpen(false)
      return
    }

    let url = linkUrl.trim()
    if (!hasValidScheme(url) && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || selection.getTextContent().trim() === '') return

      // TẠO LINK NODE CHUẨN
      const linkNode = $createLinkNode({
        fields: {
          url,
          newTab,
          linkType: 'custom' as const,
        },
      })

      // CÁCH CHUẨN NHẤT: ĐƯA TOÀN BỘ TEXT TRONG SELECTION VÀO TRONG LINK NODE
      const selectedNodes = selection.getNodes()
      const textContent = selection.getTextContent()

      // Nếu đang edit link cũ → thay thế
      let replaced = false
      selectedNodes.forEach((node) => {
        const parent = node.getParent()
        if ($isLinkNode(parent)) {
          // Giữ nguyên children cũ (nếu có format bold/italic)
          parent.getChildren().forEach(child => linkNode.append(child))
          parent.replace(linkNode)
          replaced = true
        } else if ($isLinkNode(node)) {
          node.getChildren().forEach(child => linkNode.append(child))
          node.replace(linkNode)
          replaced = true
        }
      })

      // Nếu tạo mới → chèn text vào linkNode trước khi chèn
      if (!replaced) {
        if (textContent) {
          // Giữ nguyên format (bold, italic...) của text được bôi đen
          selectedNodes.forEach((node) => {
            if (node.getType() === 'text') {
              const textNode = node as any
              const clone = textNode.__type === 'text'
                ? $createTextNode(textNode.getTextContent()).setFormat(textNode.getFormat())
                : node
              linkNode.append(clone)
            }
          })
        }
        // Chèn linkNode vào vị trí selection
        selection.insertNodes([linkNode])
      }
    })

    setIsLinkDialogOpen(false)
  }, [editor, linkUrl, newTab])

  const removeLink = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        selection.getNodes().forEach((node) => {
          const parent = node.getParent()
          if ($isLinkNode(parent)) {
            parent.remove()
          } else if ($isLinkNode(node)) {
            node.remove()
          }
        })
      }
    })
    setHasActiveLink(false)
  }, [editor])

  const openLinkDialog = () => {
    updateLinkState() // đảm bảo lấy đúng URL hiện tại
    setIsLinkDialogOpen(true)
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
      {hasActiveLink ? (
        <>
          <Button type="button" size="sm" variant="ghost" onClick={openLinkDialog} title="Edit link">
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={removeLink} title="Remove link">
            <Unlink className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button type="button" size="sm" variant="ghost" onClick={openLinkDialog} title="Insert link">
          <LinkIcon className="w-4 h-4" />
        </Button>
      )}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hasActiveLink ? 'Edit Link' : 'Insert Link'}</DialogTitle>
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
                    insertOrUpdateLink()
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="new-tab" checked={newTab} onCheckedChange={(c) => setNewTab(!!c)} />
              <Label htmlFor="new-tab">Open in new tab</Label>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={insertOrUpdateLink}>
                {hasActiveLink ? 'Update' : 'Insert'}
              </Button>
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