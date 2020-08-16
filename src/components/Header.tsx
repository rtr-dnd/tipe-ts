import React from 'react'
import styled from 'styled-components'

import logo from '../assets/logo.svg'

const HeaderBar = styled.div`
  display: flex;
  position: fixed;
  margin: 24px;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 10;
  padding: 24px 48px;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
`
const Logo = styled.img`
  display: block;
  margin: 16px;
  height: 32px;
`

function Header () {
  return (
    <HeaderBar>
      <Logo src={logo} alt='logo' />
    </HeaderBar>
  )
}

export default Header
