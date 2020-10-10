/* eslint-disable react/no-unescaped-entities */
// eslint-disable-next-line
import React, { useEffect, RefObject } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { useInView } from 'react-intersection-observer'
// eslint-disable-next-line
import Editor from 'tipe-markdown-editor'

import { useReduxDispatch } from '../redux/storeHelper'

import Tipe from './Tipe'
import {
  selectLibrary,
  addTipe,
  addTipeToThread,
  newTipeState,
  loadTipesIncementallyFromFirebase,
  pushThreadToFirebase
} from '../redux/librarySlice'
import {
  selectView,
  LoadingStatus,
  ConnectedStatus
} from '../redux/viewSlice'
import IconAdd from './icons/IconAdd'

const List = styled.div`
  max-width: 860px;
  width: 100%;
  margin: 0 auto;
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
  box-sizing: border-box;
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
const Addbt = styled.button`
  display: flex;
  align-items: center;
  padding: 24px 32px;
  background-color: transparent;
  outline: none;
  border: none;
  box-shadow: none;
  cursor: pointer;
  color: transparent;
  transition: 0.2s;
  font-size: 13px;
  text-align: center;
  svg {
    transition: 0.2s;
    height: 1.3em;
    margin-right: 12px;
    fill: ${props => props.theme.textGrey};
  }
  p {
    margin: 0;
  }
  &:hover, &:focus {
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
  const reduxDispatch = useReduxDispatch()
  const library = useSelector(selectLibrary)
  const view = useSelector(selectView)
  // eslint-disable-next-line
  const { ref, inView, entry } = useInView({
    threshold: 1,
    rootMargin: '0px'
  })
  useEffect(() => {
    if (inView) {
      console.log(LoadingStatus[view.loadingStatus])
      if (view.loadingStatus !== (LoadingStatus.loaded || LoadingStatus.migrating)) {
        const prevDistanceFromBottom = document.body.scrollHeight - window.pageYOffset
        reduxDispatch(loadTipesIncementallyFromFirebase()).then(() => {
          window.scrollTo(0, document.body.scrollHeight - prevDistanceFromBottom)
        })
      }
    }
  }, [inView])

  const indexOfThisThread = props.thread
    ? library.threads.findIndex((element) => { return element.id === props.thread })
    : -1
  const refs: {[key: string]: RefObject<Editor>} = {}
  const getOrCreateRef = (id: string) => {
    // eslint-disable-next-line
    if (!refs.hasOwnProperty(id)) {
      refs[id] = React.createRef()
    }
    return refs[id]
  }
  const getRefByIndex = (myIndex: number, relativeIndex: number) => {
    if (indexOfThisThread !== -1) {
      const indexInContext = library.threads[indexOfThisThread].children.findIndex((element) => { return element === library.tipes[myIndex].id })
      return getOrCreateRef(library.threads[indexOfThisThread].children[indexInContext + relativeIndex])
    } else {
      return getOrCreateRef(library.tipes[myIndex + relativeIndex].id)
    }
  }

  return <List>
    <Addbt onClick={() => {
      const newTipe = newTipeState()
      dispatch(addTipe(newTipe))
      if (props.thread) {
        dispatch(addTipeToThread({
          threadIndex: indexOfThisThread,
          childIndexInThread: 0,
          childIndexInTipes: 0,
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
          getRefByIndex={getRefByIndex}
          ref={getOrCreateRef(childId)}
          key={childId}
          index={library.tipes.findIndex((e) => { return e.id === childId })}
          indexOfThisThread={indexOfThisThread}
          indexInContext={i}
          readonly={props.readonly}
        />
      ))
      : library.tipes.map((thisTipe, i) => (
        <Tipe
          getRefByIndex={getRefByIndex}
          ref={getOrCreateRef(thisTipe.id)}
          key={thisTipe.id}
          index={i}
          indexOfThisThread={indexOfThisThread}
          indexInContext={i}
          readonly={false}
        />
      ))
    }
    <Loading ref={ref}>
      {LoadingMessage(view.loadingStatus, view.connectedStatus)}
    </Loading>
  </List>
}

function LoadingMessage (loadingStatus: LoadingStatus, connectedStatus: ConnectedStatus) {
  if (loadingStatus === LoadingStatus.migrating) {
    return <p>Migrating from Tipe ver 1. Please wait...</p>
  } else if (loadingStatus === LoadingStatus.loaded) {
    return <p>You've reached to the very top of your Tipes.</p>
  } else if (connectedStatus === ConnectedStatus.disconnected) {
    return <p>Looks like you're offline.</p>
  } else {
    return <p className="loading">Loading...</p>
  }
}

export default TipeList
