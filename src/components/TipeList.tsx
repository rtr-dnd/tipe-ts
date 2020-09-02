import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import Tipe from './Tipe'
import {
  selectLibrary,
  addTipe,
  addTipeToThread,
  newTipeState,
  loadFromFirebase,
  pushThreadToFirebase
} from '../redux/librarySlice'
import {
  selectView,
  setStatus
} from '../redux/viewSlice'
import IconAdd from './icons/IconAdd'

const List = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
  padding: 0 48px 40vh 48px;
  box-sizing: border-box;
`
const Loading = styled.div`
  display: flex;
  width: 100%;
  padding: 40vh 32px 64px 32px;
  color: ${props => props.theme.textGrey};
  font-size: 14px;
  border-bottom: 1px solid;
  border-color: ${props => props.theme.border};
  .loading {
    animation:blinkingText 1.5s infinite;
  }
  @keyframes blinkingText{
    0% {
      color: ${props => props.theme.textGrey};
    }
    50% {
      color: ${props => props.theme.border};
    }
  }
`
const Addbt = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 32px;
  cursor: pointer;
  color: transparent;
  transition: 0.2s;
  font-size: 13px;
  text-align: center;
  svg {
    height: 1.3em;
    margin-right: 12px;
    fill: ${props => props.theme.textGrey};
  }
  p {
    margin: 0;
  }
  &:hover {
    color: ${props => props.theme.textGrey};
    svg {
      fill: ${props => props.theme.textGreyDarker};
    }
  }
`

interface TipeListProps {
  thread?: string,
  readonly?: boolean
}

function TipeList (props: TipeListProps) {
  const dispatch = useDispatch()
  const library = useSelector(selectLibrary)
  const view = useSelector(selectView)
  const indexOfThisThread = props.thread
    ? library.threads.findIndex((element) => { return element.id === props.thread })
    : -1

  return <List>
    <Addbt onClick={() => {
      const newTipe = newTipeState()
      if (props.thread) {
        newTipe.thread = props.thread
      }
      dispatch(addTipe(newTipe))
      if (props.thread) {
        dispatch(addTipeToThread({
          threadIndex: indexOfThisThread,
          childIndex: 0,
          value: newTipe.id
        }))
        dispatch(pushThreadToFirebase(indexOfThisThread))
      }
    }}>
      <IconAdd />
      <p>⌘ + return / Ctrl + Enter</p>
    </Addbt>
    {indexOfThisThread >= 0
      ? library.threads[indexOfThisThread].children.map((childId, i) => (
        <Tipe
          key={childId}
          index={library.tipes.findIndex((e) => { return e.id === childId })}
          readonly={props.readonly}
        />
      ))
      : library.tipes.map((thisTipe, i) => (
        <Tipe
          key={thisTipe.id}
          index={i}
          readonly={false}
        />
      ))
    }
    <Loading id="loading-message">
      {LoadingMessage(view.status)}
    </Loading>
  </List>
}

function LoadingMessage (status: string) {
  switch (status) {
    case 'loaded':
      return <p>You've reached to the very top of your Tipes.</p>
    case 'disconnected':
      return <p>Looks like you're offline.</p>
    default:
      return <p className="loading">Loading...</p>
  }
}

export default TipeList
