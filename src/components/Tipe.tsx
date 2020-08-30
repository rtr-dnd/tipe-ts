import React, { useEffect, useRef, useContext } from 'react'
import Editor from 'tipe-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'
import styled, { ThemeContext } from 'styled-components'

import { editorLight, editorDark } from '../assets/colors'
import { removeTipe, editTitleOfTipe, editTextOfTipe, selectLibrary, createThread, pushTipeToFirebase, removeTipeFromFirebase } from '../redux/librarySlice'
import TitleInput from './TitleInput'

const TipeContainer = styled.div`
  padding: 48px 32px;
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  transition: 0.5s;
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

  const editorRef = useRef<Editor>(null)
  useEffect(() => {
    if (editorRef && editorRef.current) {
      editorRef.current.focusAtEnd()
    }
  }, [])

  const themeContext = useContext(ThemeContext)

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
  // 子コンポーネントを作ってそっちでstate管理をやる
  // ここでuseState(title, setTitle)とするとsetTitle()を呼び出すたびにこのコンポーネントごとre-renderされる…？
  // とにかくclearTimeoutがうまくいかない
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist()
    clearTimeout(titleTimeout)
    titleTimeout = setTimeout(() => {
      dispatch(editTitleOfTipe({
        index: props.index,
        value: e.target.value
      }))
      dispatch(pushTipeToFirebase(props.index))
    }, 1000)
  }

  return <TipeContainer>
    <Texts>
      <Editor
        ref={editorRef}
        key={library.tipes[props.index].text}
        defaultValue={library.tipes[props.index].text}
        onChange={value => onTextChange(value)}
        theme={themeContext.isDark ? editorDark : editorLight}
        readOnly={props.readonly}
        autoFocus={true}
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
      <TitleInput
        key={library.tipes[props.index].title}
        defaultValue={library.tipes[props.index].title}
        onTitleChange={onTitleChange} />
    </Titles>
  </TipeContainer>
}

export default Tipe
