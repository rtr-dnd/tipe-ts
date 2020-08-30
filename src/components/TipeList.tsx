import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import Tipe from './Tipe'
import { selectLibrary, addTipe, loadTipeFromFirebase } from '../redux/librarySlice'

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

interface TipeListProps {
  indexes: Array<number>,
  thread?: boolean,
  readonly?: boolean
}

function TipeList (props: TipeListProps) {
  const dispatch = useDispatch()
  const library = useSelector(selectLibrary)

  return <List>
    <button onClick={() => dispatch(addTipe())}>add Tipe</button>
    {props.indexes.map((i, index) => (
      <Tipe
        key={library.tipes[i].id}
        index={i}
        readonly={props.readonly}
      />
    ))}
    <Loadbt onClick={() => {
      dispatch(loadTipeFromFirebase())
    }}>Load</Loadbt>
  </List>
}

export default TipeList
