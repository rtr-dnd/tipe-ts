import React, { useState } from 'react'
import styled from 'styled-components'

const Input = styled.input`
  display: block;
  border: none;
  outline: none;
  font-size: 18px;
  color: ${props => props.theme.textGrey};
  background-color: ${props => props.theme.background};
  transition: 0.5s;
  text-align: right;
  &::placeholder {
    color: ${props => props.theme.border};
    transition: 0.1s;
  }
  &:hover {
    &::placeholder {
      color: ${props => props.theme.borderDarker};
    }
  }
`

interface TitleInputProps {
  defaultValue: string | undefined,
  onTitleChange: any
}

function TitleInput (props: TitleInputProps) {
  const [title, setTitle] = useState<string | undefined>(props.defaultValue)

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    props.onTitleChange(e)
  }

  return <Input
    type="text"
    autoFocus
    value={title}
    onChange={onTitleChange}
    placeholder="Add title" />
}

export default TitleInput
