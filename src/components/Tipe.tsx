import React, { useState, useEffect } from 'react'
import Editor from 'rich-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { removeTipe, editTitleOfTipe, editTextOfTipe, selectLibrary, createThread, pushTipeToFirebase, removeTipeFromFirebase } from '../redux/librarySlice'

const TipeContainer = styled.div`
  margin: 32px 0;
  display: flex;
`
const Texts = styled.div`
  flex-grow: 1;
`
const Titles = styled.div`
  width: 30%;
  display: flex;
  flex-direction: column;
  text-align: right;
`

interface TipeProps {
  index: number,
  readonly?: boolean,
}

function Tipe (props: TipeProps) {
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  const [title, setTitle] = useState<string | undefined>(String(library.tipes[props.index].title))

  let textTimeout: ReturnType<typeof setTimeout>
  const onTextChange = (valueFunc: () => string) => {
    clearTimeout(textTimeout)
    textTimeout = setTimeout(() => {
      dispatch(editTextOfTipe({
        index: props.index,
        value: valueFunc()
      }))
      dispatch(pushTipeToFirebase(props.index))
    }, 1000)
  }

  let titleTimeout: ReturnType<typeof setTimeout>
  let changedText: string
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    changedText = e.target.value
    clearTimeout(titleTimeout)
    titleTimeout = setTimeout(() => {
      dispatch(editTitleOfTipe({
        index: props.index,
        value: changedText
      }))
      dispatch(pushTipeToFirebase(props.index))
    }, 1000)
  }
  useEffect(() => {
    setTitle(library.tipes[props.index].title)
  }, [library.tipes[props.index].title])

  return <TipeContainer>
    <Texts>
      <Editor
        key={library.tipes[props.index].text}
        defaultValue={library.tipes[props.index].text}
        onChange={value => onTextChange(value)}
        readOnly={props.readonly}
        placeholder="Jot something down..."
      />
    </Texts>
    <Titles>
      {/* <button onClick={() => dispatch(remove(props.index))}>remove this Tipe</button> */}
      <button onClick={() => {
        dispatch(removeTipeFromFirebase(library.tipes[props.index].id))
        dispatch(removeTipe(props.index))
      }}>Remove this</button>
      <button onClick={() => { dispatch(createThread(props.index)) }}>Create thread</button>
      <p>
        {new Date(Number(library.tipes[props.index].editDate)).getHours()}:
        {new Date(Number(library.tipes[props.index].editDate)).getMinutes()}:
        {new Date(Number(library.tipes[props.index].editDate)).getSeconds()}
      </p>
      <input type="text" value={title} onChange={onTitleChange} placeholder="Add title" />
    </Titles>
  </TipeContainer>
}

export default Tipe
