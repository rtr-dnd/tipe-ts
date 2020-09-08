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
import { selectView } from '../redux/viewSlice'
import TitleInput from './TitleInput'
import IconAddThread from './icons/IconAddThread'
import IconThreadMore from './icons/IconThreadMore'
import { Redirect } from 'react-router-dom'

const TipeContainer = styled.div`
  padding: 0 32px;
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  transition: 0.5s;
`
const Texts = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  margin: 48px 0;
  p, div {
    font-size: 14px;
    line-height: 1.8em;
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
  padding: 48px 0 48px 16px;
  display: flex;
  flex-direction: column;
  text-align: right;
  align-items: flex-end;
  .hiding {
    transition: opacity 0.3s;
    opacity: 0.3;
  }
  &:hover {
    .hiding {
      opacity: 100%;
    }
    .modified-date {
      height: 1em;
      margin: 24px 0 12px 0;
    }
    .button-with-icon {
      height: 1em;
      margin-bottom: 24px;
    }
  }
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
  height: 1em;
`
const Divider = styled.div`
  display: block;
  margin-right: 0;
  margin-left: auto;
  width: 32px;
  border-bottom: 1px solid ${props => props.theme.border};
`
const ButtonWithIcon = styled.div`
  display: flex;
  justify-content: flex-end;
  font-size: 13px;
  color: ${props => props.theme.textGrey};
  transition: color 0.1s;
  cursor: pointer;
  margin-bottom: 24px;
  height: 1em;
  p {
    padding: 0;
    margin: 0;
    padding-right: 8px;
  }
  svg {
    fill: ${props => props.theme.textGrey};
  }
  &:hover {
    color: ${props => props.theme.textGreyDarker};
    svg {
      fill: ${props => props.theme.textGreyDarker};
    }
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
    }, 1000)
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
            className={'hiding button-with-icon'}
            onClick={() => {
              const newThread = newThreadState(library.tipes[props.index].id)
              dispatch(addThread(newThread))
              dispatch(editThreadOfTipe({ index: props.index, value: newThread.id }))
              dispatch(pushThreadToFirebase(0))
              handleRedirect('/thread/' + newThread.id)
            }}>
            <p>スレッドで返信</p>
            <IconAddThread />
          </ButtonWithIcon>
          : <ButtonWithIcon
            className={'hiding button-with-icon'}
            onClick={() => handleRedirect('/thread/' + library.tipes[props.index].thread)}>
            <p>Go to thread</p>
          </ButtonWithIcon>
        }
        <ButtonWithIcon
          className={'hiding button-with-icon'}>
          <p>既存のスレッドに追加</p>
          <IconThreadMore />
        </ButtonWithIcon>
        <Divider className={'hiding'} />
        <ModifiedDate className={'hiding modified-date'}>
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
