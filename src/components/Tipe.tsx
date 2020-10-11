// eslint-disable-next-line
import React, { useEffect, useState, RefObject } from 'react'
import Editor from 'tipe-markdown-editor'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

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
  newTipeState,
  addTipeToThread,
  removeTipeFromThread
} from '../redux/librarySlice'
import TitleInput from './TitleInput'
import IconThread from './icons/IconThread'
import IconAddThread from './icons/IconAddThread'
import IconThreadMore from './icons/IconThreadMore'
import IconForward from './icons/IconForward'
import { Redirect } from 'react-router-dom'
import { spawn } from 'child_process'

const TipeContainer = styled.div`
  padding: 0 32px;
  display: flex;
  border-bottom: 1px solid ${props => props.theme.border};
  transition: 0.5s;
`
const Texts = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
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
const ThreadBar = styled.div`
  padding-bottom: 16px;
  cursor: pointer;
  margin-bottom: 24px;
  border-bottom: 1px solid ${props => props.theme.border};
  display: flex;
  align-items: center;
  color: ${props => props.theme.textGrey};
  overflow: hidden;
  font-size: 13px;
  svg {
    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: 16px;
    fill: ${props => props.theme.textGrey};
  }
  p {
    margin: 0 0 0 8px;
    color: ${props => props.theme.textGrey};
    white-space: nowrap;
  }
  div {
    margin: 0;
    color: ${props => props.theme.textGrey};
    overflow: hidden;
    display: flex;
  }
`
const PreviousTipePreview = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  overflow: hidden;
  p {
    margin: 0 0 0 8px;
  }
  .previous-text {
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
    white-space: nowrap;
  }
`
const Titles = styled.div`
  width: 30%;
  flex-shrink: 0;
  padding: 48px 0 48px 16px;
  display: flex;
  flex-direction: column;
  text-align: right;
  align-items: flex-end;
  .hiding {
    transition: opacity 0.3s;
    opacity: 0.4;
    p {
      transition: opacity 0.3s;
      opacity: 0;
    }
  }
  &:hover {
    .hiding {
      opacity: 100%;
      p {
        opacity: 100%;
      }
    }
    .modified-date {
      height: 1em;
      margin: 12px 0 12px 0;
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
  bottom: 80px;
  display: flex;
  flex-direction: column-reverse;
`
const ModifiedDate = styled.p`
  color: ${props => props.theme.textGrey};
  transition: 0.5s;
  font-size: 13px;
  margin: 12px 0 12px 0;
  height: 1em;
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
  p, div {
    padding: 0;
    margin: 0;
    padding-right: 8px;
  }
  svg {
    width: 16px;
    fill: ${props => props.theme.textGrey};
  }
  &:hover, &:focus {
    opacity: 100%;
    p {
      opacity: 100%;
    }
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
  getRefByIndex: any
}
const Tipe = React.forwardRef<Editor, TipeProps>((props: TipeProps, ref: any) => {
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  const threadOfThisTipe = library.tipes[props.index].thread ? library.threads.find((element) => { return element.id === library.tipes[props.index].thread }) : null
  const indexInThread = threadOfThisTipe ? threadOfThisTipe.children.findIndex((element) => { return element == library.tipes[props.index].id }) : null

  const editorRef = ref
  useEffect(() => {
    if (props.index === 0 && editorRef && editorRef.current) {
      editorRef.current.focusAtEnd()
    }
  }, [editorRef, props.index])

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
            dispatch(removeTipeFromFirebase(library.tipes[props.index].id))
            dispatch(removeTipe(props.index))
          }
        }
        break
      case 'Enter':
        if (e.getModifierState('Meta') || e.getModifierState('Control')) {
          const newTipe = newTipeState()
          dispatch(addTipe(newTipe))
          if (props.indexOfThisThread !== -1) {
            dispatch(addTipeToThread({
              threadIndex: props.indexOfThisThread,
              childIndexInThread: 0,
              childIndexInTipes: 0,
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
      {(threadOfThisTipe && props.indexOfThisThread === -1) &&
        <ThreadBar
          onClick={() => handleRedirect('/thread/' + library.tipes[props.index].thread)}>
          <IconThread />
          <p>{threadOfThisTipe?.title === ''
            ? <span>スレッド</span>
            : <span>{threadOfThisTipe.title}</span>}
          </p>
          { threadOfThisTipe?.children.findIndex((element) => { return element === library.tipes[props.index].id }) === threadOfThisTipe.children.length - 1
            ? <PreviousTipePreview></PreviousTipePreview>
            : <PreviousTipePreview>
              <p>•</p>
              <p className="previous-text">{indexInThread &&
              library.tipes.find((element) => {
                return element.id === threadOfThisTipe.children[indexInThread + 1]
              })?.text}</p></PreviousTipePreview>
          }
          <IconForward />
        </ThreadBar>
      }
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
        {library.tipes[props.index].thread === null &&
          <ButtonWithIcon
            tabIndex={0}
            className={'hiding button-with-icon'}
            onClick={() => {
              const newThread = newThreadState()
              dispatch(addThread(newThread))
              dispatch(addTipeToThread({
                threadIndex: 0,
                childIndexInThread: 0,
                childIndexInTipes: props.index,
                value: library.tipes[props.index].id
              }))
              dispatch(pushTipeToFirebase(props.index))
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
            <p>スレッドに移動</p>
            <IconForward />
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
