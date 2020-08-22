import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import Tipe from './Tipe'
import { addTipe } from '../redux/librarySlice'

const List = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px 0;
`

interface TipeListProps {
  indexes: Array<number>,
  thread?: boolean,
  readonly?: boolean
}

function TipeList (props: TipeListProps) {
  const dispatch = useDispatch()

  return <List>
    {props.indexes.map((i, index) => (
      <Tipe
        key={index}
        index={i}
        readonly={props.readonly}
      />
    ))}
    <button onClick={() => dispatch(addTipe())}>add Tipe</button>
  </List>
}

export default TipeList
