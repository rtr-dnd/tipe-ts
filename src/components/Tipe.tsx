import React, { useState } from 'react'

interface TipeProps {
  initialText: string,
  initialTitle: string,
  date: string
}

function Tipe (props: TipeProps) {
  const [text] = useState<string>(props.initialText)
  const [title] = useState<string>(props.initialTitle)
  const [date] = useState<string>(props.date)

  return <div>
    <p>{text}</p>
    <p>{title}</p>
    <p>{date}</p>
  </div>
}

export default Tipe
