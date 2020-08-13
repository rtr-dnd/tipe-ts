import React, { useState } from 'react'
import Editor from 'rich-markdown-editor'

interface TipeProps {
  initialText?: string,
  initialTitle?: string,
  date?: string,
  readonly?: boolean,

}
const defaultTipeProps: TipeProps = {
  initialText: undefined,
  initialTitle: '',
  date: '',
  readonly: false
}

function Tipe (props: TipeProps) {
  const [text, setText] = useState<string | undefined>(props.initialText)
  const [title, setTitle] = useState<string | undefined>(props.initialTitle)
  const [date, setDate] = useState<string | undefined>(props.date)

  let timeout: any
  const onTextChange = (valueFunc: () => string) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      setText(valueFunc())
    }, 500)
  }

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setDate(String(new Date()))
  }

  return <div>
    <input type="text" value={title} onChange={onTitleChange} placeholder="Add title" />
    <p>{date}</p>
    <Editor
      defaultValue={text}
      onChange={value => onTextChange(value)}
      readOnly={props.readonly}
      placeholder="Jot something down..."
    />
  </div>
}

Tipe.defaultProps = defaultTipeProps

export default Tipe
