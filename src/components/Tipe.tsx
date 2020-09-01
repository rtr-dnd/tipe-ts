import React, { useEffect, useRef, useState } from 'react'
import Editor from 'tipe-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import {
  newThreadState,
  addThread,
  removeTipe,
  editTitleOfTipe,
  editTextOfTipe,
  selectLibrary,
  pushTipeToFirebase,
  removeTipeFromFirebase,
  pushThreadToFirebase,
  editThreadOfTipe
} from '../redux/librarySlice'
import TitleInput from './TitleInput'
import IconAddThread from './icons/IconAddThread'
import { Redirect } from 'react-router-dom'

const TipeContainer = styled.div`
  padding: 48px 32px;
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  transition: 0.5s;
`
const Texts = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  p, div {
    font-size: 14px;
    line-height: 1.7em;
    transition: 0.5s;
    background: transparent;
    color: ${props => props.theme.text};
    &.placeholder:before {
      color: ${props => props.theme.textGrey};
      transition: 0.5s;
    }
  }
  
`
const Titles = styled.div`
  width: 35%;
  flex-shrink: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  text-align: right;
`
const Spacer = styled.div`
  flex-grow: 1;
`
const Sticky = styled.div`
  position: sticky;
  bottom: 48px;
`
const ModifiedDate = styled.p`
  color: ${props => props.theme.textGrey};
  transition: 0.5s;
  font-size: 13px;
  margin: 24px 0 12px 0;
`
const Divider = styled.div`
  display: inline-block;
  width: 32px;
  border-bottom: 1px solid ${props => props.theme.border};
`
const ButtonWithIcon = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 13px;
  color: ${props => props.theme.textGrey};
  margin-bottom: 12px;
  transition: 0.5s;
  cursor: pointer;
  p {
    padding: 0;
    margin: 0;
    padding-right: 8px;
  }
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
    }, 100)
  }

  const [redirect, setRedirect] = useState<boolean>(false)
  const [redirectPath, setRedirectPath] = useState<string>('/')
  const handleRedirect = (path: string) => {
    setRedirectPath(path)
    setRedirect(true)
  }

  return <TipeContainer>
    {redirect && <Redirect push to={redirectPath} />}
    <Texts>
      <Editor
        ref={editorRef}
        key={library.tipes[props.index].lastSessionId}
        defaultValue={library.tipes[props.index].text}
        onChange={value => onTextChange(value)}
        readOnly={props.readonly}
        autoFocus={true}
        placeholder="Jot something down..."
      />
    </Texts>
    <Titles>
      <Spacer />
      <Sticky>
        {/* <button onClick={() => {
          dispatch(removeTipeFromFirebase(library.tipes[props.index].id))
          dispatch(removeTipe(props.index))
        }}>Remove this</button> */}
        {library.tipes[props.index].thread === null
          ? <ButtonWithIcon
            onClick={() => {
              const newThread = newThreadState(library.tipes[props.index].id)
              dispatch(addThread(newThread))
              dispatch(editThreadOfTipe({ index: props.index, value: newThread.id }))
              dispatch(pushThreadToFirebase(0))
              handleRedirect('/thread/' + newThread.id)
            }}>
            <p>Create thread</p>
            <IconAddThread />
          </ButtonWithIcon>
          : <ButtonWithIcon
            onClick={() => handleRedirect('/thread/' + library.tipes[props.index].thread)}>
            <p>Go to thread</p>
          </ButtonWithIcon>
        }
        <Divider />
        <ModifiedDate>
          {new Date(Number(library.tipes[props.index].editDate)).getHours()}:
          {new Date(Number(library.tipes[props.index].editDate)).getMinutes()}:
          {new Date(Number(library.tipes[props.index].editDate)).getSeconds()}
        </ModifiedDate>
        <TitleInput
          key={library.tipes[props.index].title}
          defaultValue={library.tipes[props.index].title}
          onTitleChange={onTitleChange} />
      </Sticky>
    </Titles>
  </TipeContainer>
}

export default Tipe
