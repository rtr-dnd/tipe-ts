import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import Tipe from './Tipe'
import { selectLibrary, addNewTipe, loadTipeFromFirebase } from '../redux/librarySlice'

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
  indexes: Array<number>,
  thread?: boolean,
  readonly?: boolean
}

function TipeList (props: TipeListProps) {
  const dispatch = useDispatch()
  const library = useSelector(selectLibrary)

  return <List>
    <Addbt onClick={() => dispatch(addNewTipe())}>add Tipe</Addbt>
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
