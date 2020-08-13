import React from 'react'
import Tipe from '../components/Tipe'

function IndexPage () {
  const tipeProps = {
    initialText: undefined,
    initialTitle: 'what a brilliant title',
    date: ''
  }
  return (
    <div>
      This is index
      <Tipe
        initialText={tipeProps.initialText}
        initialTitle={tipeProps.initialTitle}
        date={tipeProps.date} />
      <Tipe />
    </div>
  )
}

export default IndexPage
