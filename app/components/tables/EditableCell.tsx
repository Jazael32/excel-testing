'use client'

import { useRef, useState } from 'react'

// If the original value was a number and the new text is numeric, keep it a number
function coerce(original: unknown, text: string): unknown {
  const trimmed = text.trim()
  if (typeof original === 'number' && trimmed !== '') {
    const n = Number(trimmed)
    if (Number.isFinite(n)) return n
  }
  return text
}

interface EditableCellProps {
  value: unknown
  onCommit: (value: unknown) => void
  readOnly?: boolean
}

export function EditableCell({ value, onCommit, readOnly }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const skipCommit = useRef(false)

  const display = value !== null && value !== undefined ? String(value) : ''

  const start = () => {
    if (readOnly) return
    skipCommit.current = false
    setDraft(display)
    setEditing(true)
  }

  const commit = () => {
    setEditing(false)
    if (skipCommit.current) return
    if (draft !== display) onCommit(coerce(value, draft))
  }

  if (!editing) {
    return (
      <span
        onDoubleClick={start}
        title={readOnly ? undefined : 'Double-click to edit'}
        className={`block min-w-[4rem] ${readOnly ? '' : 'cursor-text'}`}
      >
        {display ? (
          <span className="text-slate-300">{display}</span>
        ) : (
          <span className="text-slate-600 italic">empty</span>
        )}
      </span>
    )
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          skipCommit.current = true
          e.currentTarget.blur()
        }
      }}
      className="w-full min-w-[8rem] px-2 py-1 bg-[#1a1d24] border border-cyan-500/50 rounded text-sm text-slate-200 focus:outline-none"
    />
  )
}