import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'

import IconBack from './icons/IconBack'
import IconThread from './icons/IconThread'

const Container = styled.div`
  // flex-grow: 1;
  flex-shrink: 1;
  box-sizing: border-box;
  display: flex;
  flex-basis: 800px;
  max-width: 800px;
  align-items: center;
  padding: 24px;
  background-color: ${props => props.theme.backgroundTransparent};
  color: ${props => props.theme.textGrey};
  transition: 0.5s;
`
const ThreadTitleContainer = styled.div`
  padding: 0px 16px;
  flex-grow: 1;
`
const ThreadIndicator = styled.div`
  display: flex;
  font-size: 12px;
  color: ${props => props.theme.textGrey}
  vertical-align: middle;
  margin-bottom: 2px;
  p {
    display: flex;
    align-items: center;
    margin: 0;
  }
  svg {
    display: block;
    padding: 4px;
    transition: 0.5s;
  }`

const Input = styled.input`
  display: block;
  border: none;
  outline: none;
  font-size: 16px;
  width: 100%;
  color: ${props => props.theme.textGrey};
  background-color: transparent;
  transition: 0.5s;
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

function ThreadControl () {
  const params = useParams()

  const threadId = (params as any).threadId ? (params as any).threadId : 'no thread'

  return (
    <Container>
      <Link to='/'>
        <IconBack />
      </Link>
      <ThreadTitleContainer>
        <ThreadIndicator>
          <IconThread />
          <p>スレッド</p>
        </ThreadIndicator>
        <Input type="text" placeholder="スレッドタイトルを追加" />
      </ThreadTitleContainer>
    </Container>
  )
}

export default ThreadControl
