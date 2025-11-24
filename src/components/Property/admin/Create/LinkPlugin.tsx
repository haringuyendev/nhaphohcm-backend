// components/LinkCommandPlugin.tsx
'use client'

import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TOGGLE_LINK_COMMAND} from '@payloadcms/richtext-lexical/client'

export default function LinkCommandPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    // ĐĂNG KÝ COMMAND – QUAN TRỌNG NHẤT!
    return editor.registerCommand(
      TOGGLE_LINK_COMMAND,
      (payload) => {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, payload)
        return true
      },
      0
    )
  }, [editor])

  return null
}