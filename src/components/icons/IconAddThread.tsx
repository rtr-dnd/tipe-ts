import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'

function IconAddThread () {
  const themeContext = useContext(ThemeContext)
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M1.33329 2.66671C1.33329 1.93337 1.93329 1.33337 2.66662 1.33337H13.3333C14.0666 1.33337 14.6666 1.93337 14.6666 2.66671V10.6667C14.6666 11.4 14.0666 12 13.3333 12H3.99996L1.33329 14.6667V2.66671ZM2.66662 11.4467L3.44662 10.6667H13.3333V2.6667H2.66662V11.4467ZM8.66662 3.33337H7.33329V6.00004H4.66662V7.33337H7.33329V10H8.66662V7.33337H11.3333V6.00004H8.66662V3.33337Z"
        fill={themeContext.textGrey}/>
    </svg>
  )
}

export default IconAddThread