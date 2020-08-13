import React from 'react'
import Tipe from '../components/Tipe'

function IndexPage () {
  const tipeProps = {
    initialText: 'what a brilliant text',
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
    </div>
  )
}

export default IndexPage
