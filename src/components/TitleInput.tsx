import React, { useState } from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'

import {
  selectLibrary
} from '../redux/librarySlice'

const Input = styled.input`
  display: block;
  border: none;
  outline: none;
  font-size: 18px;
  color: ${props => props.theme.textGrey};
  background-color: transparent;
  transition: 0.5s;
  text-align: right;
  &::placeholder {
    color: ${props => props.theme.border};
    transition: 0.1s;
  }
  &:hover, &:focus {
    &::placeholder {
      color: ${props => props.theme.borderDarker};
    }
  }
`

interface TitleInputProps {
  index: number,
  onTitleChange: any
}

function TitleInput (props: TitleInputProps) {
  const library = useSelector(selectLibrary)
  const [title, setTitle] = useState<string | undefined>(library.tipes[props.index].title)

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    props.onTitleChange(e)
  }

  return <Input
    type="text"
    // autoFocus
    value={title}
    onChange={onTitleChange}
    placeholder="Add title" />
}

export default TitleInput
