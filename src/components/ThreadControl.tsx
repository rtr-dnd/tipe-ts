import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useSelector, useDispatch } from 'react-redux'

import { selectLibrary, editTitleOfThread, pushThreadToFirebase } from '../redux/librarySlice'

import IconBack from './icons/IconBack'
import IconThread from './icons/IconThread'
import IconSettings from './icons/IconSettings'

const Container = styled.div`
  // flex-grow: 1;
  flex-shrink: 1;
  box-sizing: border-box;
  display: flex;
  flex-basis: 860px;
  max-width: 860px;
  align-items: center;
  padding: 0 16px;
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
  font-size: 13px;
  color: ${props => props.theme.textGrey}
  vertical-align: middle;
  margin-bottom: 2px;
  align-items: center;
  p {
    display: flex;
    align-items: center;
    margin: 0;
  }
  svg {
    display: flex;
    align-items: center;
    padding: 0 4px;
    transition: 0.5s;
    width: 14px;
  }`

const Input = styled.input`
  display: block;
  border: none;
  outline: none;
  font-size: 16px;
  width: 100%;
  color: ${props => props.theme.textGrey};
  background-color: transparent;
  transition: 0.1s;
  &::placeholder {
    color: ${props => props.theme.border};
    transition: 0.1s;
  }
  &:hover, &:focus {
    color: ${props => props.theme.textGreyDarker};
    &::placeholder {
      color: ${props => props.theme.borderDarker};
    }
  }
`
const Settings = styled.div`
  display: flex;
  font-size: 14px;
  svg {
    width: 20px;
    margin-left: 8px;
  }
`

function ThreadControl () {
  const params = useParams()
  const library = useSelector(selectLibrary)
  const dispatch = useDispatch()

  const threadId = (params as any).threadId ? (params as any).threadId : 'no thread'
  const indexOfThisThread = library.threads.findIndex((element) => { return element.id === threadId })
  const [title, setTitle] = useState<string | undefined>(library.threads[indexOfThisThread].title)

  let titleTimeout: ReturnType<typeof setTimeout>
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist()
    setTitle(e.target.value)
    clearTimeout(titleTimeout)
    titleTimeout = setTimeout(() => {
      dispatch(editTitleOfThread({
        index: indexOfThisThread,
        value: e.target.value
      }))
      dispatch(pushThreadToFirebase(indexOfThisThread))
    }, 1000)
  }

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
        <Input
          type="text"
          value={title}
          onChange={onTitleChange}
          placeholder="スレッドタイトルを追加" />
      </ThreadTitleContainer>
      <Settings>
        <p>スレッドの設定</p>
        <IconSettings />
      </Settings>
    </Container>
  )
}

export default ThreadControl
