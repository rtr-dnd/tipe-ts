import React, { useState, useEffect } from 'react'

interface Props {
    message: string,
    updateIsActive: (isActive: boolean) => void
}

function Button (props: Props) {
  const [isActive, setIsActive] = useState<boolean>(false)

  useEffect(() => {
    document.title = `Current state is ${isActive}`
  })

  return <button onClick={ () => {
    setIsActive(!isActive)
    props.updateIsActive(isActive)
  }}>{props.message} {isActive.toString()} button</button>
}

export default Button
