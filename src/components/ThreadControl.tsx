import React from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'

import IconBack from './icons/IconBack'

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  max-width: 800px;
  align-items: center;
  padding: 24px;
  color: ${props => props.theme.textGrey};
`

function ThreadControl () {
  const params = useParams()

  const threadId = (params as any).threadId ? (params as any).threadId : 'no thread'

  return (
    <Container>
      {threadId === 'no thread'
        ? <div>スレッドなし</div>
        : <Link to='/'>
          <IconBack />
        </Link>
      }
    </Container>
  )
}

export default ThreadControl
