import React, { useEffect, useState, RefObject } from 'react'
import Editor from 'tipe-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'

import {
  newThreadState,
  addThread,
  removeTipe,
  addTipe,
  editTitleOfTipe,
  editTextOfTipe,
  selectLibrary,
  pushTipeToFirebase,
  removeTipeFromFirebase,
  pushThreadToFirebase,
  editThreadOfTipe,
  newTipeState,
  addTipeToThread,
  removeTipeFromThread
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
  display: flex;
  flex-direction: column-reverse;
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
const ButtonWithIcon = styled.button`
  background-color: transparent;
  border: none;
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
  &:hover, &:focus {
    opacity: 100%;
    outline: none;
    color: ${props => props.theme.textGreyDarker};
    svg {
      fill: ${props => props.theme.textGreyDarker};
    }
  }
`

interface TipeProps {
  index: number, // tipesの中でのindexなのでthreadsかどうかとかは関係ない
  indexOfThisThread: number,
  indexInContext: number,
  readonly?: boolean,
  forwardedRef: RefObject<Editor>,
  getRefByIndex: any
}
const Tipe = React.forwardRef<Editor, TipeProps>((props: TipeProps) => {
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  const editorRef = props.forwardedRef
  useEffect(() => {
    if (props.index === 0 && editorRef && editorRef.current) {
      editorRef.current.focusAtEnd()
    }
  }, [])

  let textTimeout: ReturnType<typeof setTimeout>
  const onTextChange = (valueFunc: () => string) => {
    dispatch(editTextOfTipe({
      index: props.index,
      value: valueFunc()
    }))
    clearTimeout(textTimeout)
    textTimeout = setTimeout(() => {
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

  const [placeholder, setPlaceholder] = useState<string>('Jot something down...')
  const handleKeydown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Backspace':
        if (
          library.tipes[props.index].text === '\\' ||
          library.tipes[props.index].text === '\\\n' ||
          library.tipes[props.index].text === '') {
          // setPlaceholder('Press Backspace twice to delete')
          // e.preventDefault()
          const lengthOfContext = props.indexOfThisThread === -1
            ? library.tipes.length
            : library.threads[props.indexOfThisThread].children.length
          if (props.indexInContext < lengthOfContext - 1) {
            props.getRefByIndex(props.index, 1).current.focusAtEnd()
            if (props.indexOfThisThread !== -1) {
              dispatch(removeTipeFromThread({
                threadIndex: props.indexOfThisThread,
                childIndex: library.threads[props.indexOfThisThread].children.findIndex((element) => { return element === library.tipes[props.index].id }),
                value: ''
              }))
            }
            dispatch(removeTipeFromFirebase(library.tipes[props.index].id))
            dispatch(removeTipe(props.index))
          }
        }
        break
      case 'Enter':
        if (e.getModifierState('Meta') || e.getModifierState('Control')) {
          const newTipe = newTipeState()
          if (props.indexOfThisThread !== -1) {
            newTipe.thread = library.threads[props.indexOfThisThread].id
          }
          dispatch(addTipe(newTipe))
          if (props.indexOfThisThread !== -1) {
            dispatch(addTipeToThread({
              threadIndex: props.indexOfThisThread,
              childIndex: 0,
              value: newTipe.id
            }))
          }
        }
        break
      case 'ArrowDown':
        if (e.getModifierState('Meta') || e.getModifierState('Control')) {
          if (props.indexInContext !== 0) {
            e.preventDefault()
            props.getRefByIndex(props.index, -1).current.focusAtEnd()
          }
        }
        break
      case 'ArrowUp':
        if (e.getModifierState('Meta') || e.getModifierState('Control')) {
          const lengthOfContext = props.indexOfThisThread === -1
            ? library.tipes.length
            : library.threads[props.indexOfThisThread].children.length
          if (props.indexInContext < lengthOfContext - 1) {
            console.log(props.indexInContext)
            console.log(lengthOfContext)
            e.preventDefault()
            props.getRefByIndex(props.index, 1).current.focusAtEnd()
          } else {
            console.log('prevented')
          }
        }
        break
    }
  }

  return <TipeContainer>
    {redirect && <Redirect push to={redirectPath} />}
    <Texts>
      <Editor
        ref={editorRef}
        key={library.tipes[props.index].lastSessionId}
        defaultValue={library.tipes[props.index].text}
        onChange={value => onTextChange(value)}
        onKeyDown={handleKeydown}
        readOnly={props.readonly}
        autoFocus={false}
        placeholder={placeholder}
      />
    </Texts>
    <Titles>
      <Spacer />
      <Sticky>
        {/* <button onClick={() => {
          dispatch(removeTipeFromFirebase(library.tipes[props.index].id))
          dispatch(removeTipe(props.index))
        }}>Remove this</button> */}

        <TitleInput
          index={props.index}
          key={library.tipes[props.index].lastSessionId}
          onTitleChange={onTitleChange} />
        <ModifiedDate className={'hiding modified-date'}>
          {new Date(Number(library.tipes[props.index].editDate)).getHours()}:
          {new Date(Number(library.tipes[props.index].editDate)).getMinutes()}:
          {new Date(Number(library.tipes[props.index].editDate)).getSeconds()}
        </ModifiedDate>
        <Divider className={'hiding'} />
        {library.tipes[props.index].thread === null &&
          <ButtonWithIcon
            tabIndex={0}
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
        }
        {(library.tipes[props.index].thread !== null && props.indexOfThisThread === -1) &&
          <ButtonWithIcon
            tabIndex={0}
            className={'hiding button-with-icon'}
            onClick={() => handleRedirect('/thread/' + library.tipes[props.index].thread)}>
            <p>Go to thread</p>
          </ButtonWithIcon>
        }
        <ButtonWithIcon
          tabIndex={0}
          className={'hiding button-with-icon'}>
          <p>既存のスレッドに追加</p>
          <IconThreadMore />
        </ButtonWithIcon>
      </Sticky>
    </Titles>
  </TipeContainer>
})

Tipe.displayName = 'Tipe'

export default Tipe
