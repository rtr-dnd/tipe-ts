import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import styled, { ThemeContext } from 'styled-components'

import logoLight from '../assets/logo-light.svg'
import logoDark from '../assets/logo-dark.svg'

const HeaderBar = styled.div`
  display: flex;
  position: fixed;
  margin: 24px;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 10;
  padding: 24px 48px;
  align-items: center;
  background-color: ${props => props.theme.backgroundTransparent};
  transition: 0.5s;
`
const Logo = styled.img`
  display: block;
  margin: 16px;
  height: 32px;
`

function Header () {
  const themeContext = useContext(ThemeContext)

  return (
    <HeaderBar>
      <Link to='/'>
        <Logo src={themeContext.isDark ? logoDark : logoLight} alt='logo' />
      </Link>
    </HeaderBar>
  )
}

export default Header
