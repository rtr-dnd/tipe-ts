import React, { useState } from 'react'
import Editor from 'rich-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'

import { remove, editTitle, editText, selectLibrary } from '../redux/slice'

interface TipeProps {
  index: number,
  readonly?: boolean,

}

function Tipe (props: TipeProps) {
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  const [title, setTitle] = useState<string | undefined>(String(library.content[props.index].title))

  let textTimeout: ReturnType<typeof setTimeout>
  const onTextChange = (valueFunc: () => string) => {
    clearTimeout(textTimeout)
    textTimeout = setTimeout(() => {
      dispatch(editText({
        index: props.index,
        value: valueFunc()
      }))
    }, 500)
  }

  let titleTimeout: ReturnType<typeof setTimeout>
  let changedText: string
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    changedText = e.target.value
    clearTimeout(titleTimeout)
    titleTimeout = setTimeout(() => {
      dispatch(editTitle({
        index: props.index,
        value: changedText
      }))
    }, 500)
  }

  return <div>
    <input type="text" value={title} onChange={onTitleChange} placeholder="Add title" />
    <p>{library.content[props.index].date}</p>
    <Editor
      defaultValue={library.content[props.index].text}
      onChange={value => onTextChange(value)}
      readOnly={props.readonly}
      placeholder="Jot something down..."
    />
    <button onClick={() => dispatch(remove(props.index))}>remove this Tipe</button>
  </div>
}

export default Tipe
