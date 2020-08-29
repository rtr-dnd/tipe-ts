import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import Tipe from './Tipe'
import { addTipe, loadTipeFromFirebase } from '../redux/librarySlice'

const List = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-end;
  padding: 32px 0;
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

  return <List>
    <button onClick={() => dispatch(addTipe())}>add Tipe</button>
    {props.indexes.map((i, index) => (
      <Tipe
        key={index}
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
