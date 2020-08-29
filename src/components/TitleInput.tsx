import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'

const Input = styled.input``

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

  return <input
    type="text"
    autoFocus
    value={title}
    onChange={onTitleChange}
    placeholder="Add title" />
}

export default TitleInput
