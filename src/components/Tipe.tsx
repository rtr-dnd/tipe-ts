import React from 'react'
import Editor from 'rich-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { removeTipe, editTitleOfTipe, editTextOfTipe, selectLibrary, createThread, pushTipeToFirebase, removeTipeFromFirebase } from '../redux/librarySlice'
import TitleInput from './TitleInput'

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

  let textTimeout: ReturnType<typeof setTimeout>
  const onTextChange = (valueFunc: () => string) => {
    console.log('clearing:' + textTimeout)
    clearTimeout(textTimeout)
    textTimeout = setTimeout(() => {
      console.log('firing 2')
      dispatch(editTextOfTipe({
        index: props.index,
        value: valueFunc()
      }))
      dispatch(pushTipeToFirebase(props.index))
    }, 1000)
    console.log('made:' + textTimeout)
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
        key={library.tipes[props.index].text}
        defaultValue={library.tipes[props.index].text}
        onChange={value => onTextChange(value)}
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
