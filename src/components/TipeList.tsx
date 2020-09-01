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

const List = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
  padding: 40vh 48px;
  box-sizing: border-box;
`
const Loadbt = styled.button`
  position: fixed;
  top: 0;
  right: 0;
`
const Addbt = styled.div`
  padding: 32px 0;
  cursor: pointer;
  color: ${props => props.theme.textGrey};
  transition: 0.5s;
  font-size: 13px;
  text-align: center;
`

interface TipeListProps {
  thread?: string,
  readonly?: boolean
}

function TipeList (props: TipeListProps) {
  const dispatch = useDispatch()
  const library = useSelector(selectLibrary)
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
    }}>add Tipe</Addbt>
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
    <Loadbt onClick={() => {
      dispatch(loadFromFirebase())
    }}>Load</Loadbt>
  </List>
}

export default TipeList
