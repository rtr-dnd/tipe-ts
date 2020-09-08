import React, { useContext } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'

import ThreadControl from './ThreadControl'
import logoLight from '../assets/logo-light.svg'
import logoDark from '../assets/logo-dark.svg'
import IconBack from './icons/IconBack'

const HeaderBar = styled.div`
  display: flex;
  width: 100%;
  position: fixed;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 10;
  padding: 24px 48px;
  align-items: center;
  background-color: ${props => props.theme.backgroundTransparent};
  transition: 0.5s;
  svg {
    fill: ${props => props.theme.textGrey};
  }
`
const Logo = styled.img`
  flex-grow: 1;
  display: block;
  margin: 16px;
  height: 32px;
  margin-right: auto;
`
const Icons = styled.div`
  flex-grow: 1;
  margin-left: auto;
`

function Header () {
  const themeContext = useContext(ThemeContext)
  const params = useParams()

  const threadId = (params as any).threadId ? (params as any).threadId : 'no thread'

  return (
    <HeaderBar>
      <Link to='/'>
        <Logo src={themeContext.isDark ? logoDark : logoLight} alt='logo' />
      </Link>
      {threadId
        ? <ThreadControl />
        : <ThreadControl />
      }
      <Icons>
        <IconBack />
      </Icons>
    </HeaderBar>
  )
}

export default Header
