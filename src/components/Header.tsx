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
  padding: 8px 48px;
  align-items: stretch;
  transition: 0.5s;
  svg {
    fill: ${props => props.theme.textGrey};
  }
`
const LogoSection = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  padding: 32px;
  transition: 0.5s;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: ${props => props.theme.backgroundTransparent};
`
const Logo = styled.img`
  display: block;
  height: 32px;
`
const Icons = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  padding: 32px 16px;
  display: flex;
  align-items: center;
  margin-left: auto;
  transition: 0.5s;
  background-color: ${props => props.theme.backgroundTransparent};
`
const EmptyThreadControl = styled.div`
  flex-shrink: 1;
  box-sizing: border-box;
  flex-basis: 800px;
  max-width: 800px;
  background-color: transparent;
`

function Header () {
  const themeContext = useContext(ThemeContext)
  const params = useParams()

  const threadId = (params as any).threadId ? (params as any).threadId : 'no thread'

  return (
    <HeaderBar>
      <LogoSection>
        <Link to='/'>
          <Logo src={themeContext.isDark ? logoDark : logoLight} alt='logo' />
        </Link>
      </LogoSection>
      {threadId !== 'no thread'
        ? <ThreadControl />
        : <EmptyThreadControl />
      }
      <Icons>
        <IconBack />
      </Icons>
    </HeaderBar>
  )
}

export default Header
